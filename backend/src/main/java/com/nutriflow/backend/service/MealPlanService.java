package com.nutriflow.backend.service;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nutriflow.backend.model.Meal;
import com.nutriflow.backend.model.MealPlanEntry;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.MealPlanEntryRepository;
import com.nutriflow.backend.repository.MealRepository;

@Service
public class MealPlanService {
    public static final int PLAN_DAYS = 14;
    public static final int MAX_ENTRIES_PER_DAY = 12;
    public static final List<String> MEAL_TYPES = List.of("breakfast", "lunch", "dinner", "snack");

    private static final double MAX_CALORIES = 10_000;
    private static final double MAX_GRAMS = 1_000;
    private static final double MAX_SERVINGS = 20;
    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_NOTES_LENGTH = 500;

    private static final Comparator<MealPlanEntry> ENTRY_ORDER = Comparator
            .comparing(MealPlanEntry::getPlanDate)
            .thenComparingInt((MealPlanEntry entry) -> MEAL_TYPES.indexOf(entry.getMealType()))
            .thenComparing(MealPlanEntry::getId);

    private final MealPlanEntryRepository entries;
    private final MealRepository meals;
    private final ZoneId defaultZone;

    public MealPlanService(MealPlanEntryRepository entries, MealRepository meals,
                           @Value("${app.meal-plan.time-zone:}") String configuredZone) {
        this.entries = entries;
        this.meals = meals;
        this.defaultZone = configuredZone.isBlank() ? ZoneId.systemDefault() : ZoneId.of(configuredZone.trim());
    }

    public PlanWindow window(String timeZone) {
        ZoneId zone = defaultZone;
        if (timeZone != null && !timeZone.isBlank()) {
            try {
                zone = ZoneId.of(timeZone.trim());
            } catch (DateTimeException error) {
                throw bad("Unknown time zone.");
            }
        }
        LocalDate today = LocalDate.now(zone);
        return new PlanWindow(today, today.plusDays(PLAN_DAYS - 1));
    }

    @Transactional(readOnly = true)
    public List<MealPlanEntry> entries(User user, LocalDate from, LocalDate to) {
        List<MealPlanEntry> found = new ArrayList<>(
                entries.findAllByUserIdAndPlanDateBetweenOrderByPlanDateAscIdAsc(user.getId(), from, to));
        found.sort(ENTRY_ORDER);
        return found;
    }

    @Transactional
    public MealPlanEntry create(User user, PlanWindow window, EntryDraft draft) {
        if (draft == null) throw bad("Request body is required.");
        LocalDate date = window.require(draft.date());
        ensureRoom(user, date);
        MealPlanEntry entry = new MealPlanEntry(user, date, mealType(draft.mealType()));

        if (draft.mealId() != null) {
            copyFromSavedMeal(entry, ownedMeal(user, draft.mealId()));
        } else if (draft.name() == null || draft.name().isBlank()) {
            throw bad("Choose a saved meal or enter a meal name.");
        }

        applyDetails(entry, draft);
        if (entry.getName() == null || entry.getName().isBlank()) entry.setName("Untitled meal");
        return entries.save(entry);
    }

    @Transactional
    public MealPlanEntry update(User user, Long id, PlanWindow window, EntryDraft draft) {
        if (draft == null) throw bad("Request body is required.");
        MealPlanEntry entry = ownedEntry(user, id);

        if (draft.date() != null) {
            LocalDate date = window.require(draft.date());
            if (!date.equals(entry.getPlanDate())) {
                ensureRoom(user, date);
                entry.setPlanDate(date);
            }
        }
        if (draft.mealType() != null) entry.setMealType(mealType(draft.mealType()));
        if (draft.mealId() != null) copyFromSavedMeal(entry, ownedMeal(user, draft.mealId()));

        applyDetails(entry, draft);
        if (entry.getName() == null || entry.getName().isBlank()) entry.setName("Untitled meal");
        return entries.save(entry);
    }

    @Transactional
    public List<MealPlanEntry> repeat(User user, Long id, PlanWindow window, List<String> dates) {
        MealPlanEntry source = ownedEntry(user, id);
        if (dates == null || dates.isEmpty()) throw bad("Choose at least one day.");

        Set<LocalDate> targets = new LinkedHashSet<>();
        for (String value : dates) targets.add(window.require(value));

        List<MealPlanEntry> copies = new ArrayList<>();
        for (LocalDate date : targets) {
            ensureRoom(user, date);
            copies.add(entries.save(source.copyTo(date)));
        }
        return copies;
    }

    @Transactional
    public void delete(User user, Long id) {
        entries.delete(ownedEntry(user, id));
    }

    @Transactional
    public long clearDay(User user, PlanWindow window, String date) {
        return entries.deleteAllByUserIdAndPlanDate(user.getId(), window.require(date));
    }

    @Transactional(readOnly = true)
    public List<PrepItem> prepList(User user, PlanWindow range) {
        Map<String, PrepAccumulator> groups = new LinkedHashMap<>();
        for (MealPlanEntry entry : entries(user, range.start(), range.end())) {
            String key = entry.getSourceMealId() + "|" + entry.getName().trim().toLowerCase(Locale.ROOT);
            groups.computeIfAbsent(key, ignored -> new PrepAccumulator(entry)).add(entry);
        }
        return groups.values().stream()
                .map(PrepAccumulator::toItem)
                .sorted(Comparator.comparing((PrepItem item) -> item.dates().get(0))
                        .thenComparing(PrepItem::name, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private void copyFromSavedMeal(MealPlanEntry entry, Meal meal) {
        entry.setSourceMealId(meal.getId());
        entry.setName(meal.getName());
        entry.setCalories(meal.getCalories());
        entry.setProtein(meal.getProtein());
        entry.setCarbs(meal.getCarbs());
        entry.setFat(meal.getFat());
    }

    private void applyDetails(MealPlanEntry entry, EntryDraft draft) {
        if (draft.name() != null) {
            String name = draft.name().trim();
            if (name.isEmpty()) throw bad("Meal name cannot be blank.");
            if (name.length() > MAX_NAME_LENGTH) throw bad("Meal name is too long.");
            entry.setName(name);
        }
        if (draft.calories() != null) {
            entry.setCalories((int) Math.round(inRange(draft.calories(), 0, MAX_CALORIES, "Calories")));
        }
        if (draft.protein() != null) entry.setProtein(inRange(draft.protein(), 0, MAX_GRAMS, "Protein"));
        if (draft.carbs() != null) entry.setCarbs(inRange(draft.carbs(), 0, MAX_GRAMS, "Carbs"));
        if (draft.fat() != null) entry.setFat(inRange(draft.fat(), 0, MAX_GRAMS, "Fat"));
        if (draft.servings() != null) {
            double servings = inRange(draft.servings(), 0, MAX_SERVINGS, "Servings");
            if (servings <= 0) throw bad("Servings must be more than 0.");
            entry.setServings(servings);
        }
        if (draft.notes() != null) {
            String notes = draft.notes().trim();
            if (notes.length() > MAX_NOTES_LENGTH) throw bad("Notes must be 500 characters or fewer.");
            entry.setNotes(notes.isEmpty() ? null : notes);
        }
        if (draft.prepared() != null) entry.setPrepared(draft.prepared());
        if (draft.eaten() != null) entry.setEaten(draft.eaten());
    }

    private void ensureRoom(User user, LocalDate date) {
        if (entries.countByUserIdAndPlanDate(user.getId(), date) >= MAX_ENTRIES_PER_DAY) {
            throw bad("That day already has " + MAX_ENTRIES_PER_DAY + " meals planned.");
        }
    }

    private MealPlanEntry ownedEntry(User user, Long id) {
        return entries.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Planned meal not found."));
    }

    private Meal ownedMeal(User user, Long mealId) {
        return meals.findById(mealId)
                .filter(meal -> meal.getUser() != null && meal.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved meal not found."));
    }

    private String mealType(String value) {
        String type = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!MEAL_TYPES.contains(type)) throw bad("Meal type must be breakfast, lunch, dinner, or snack.");
        return type;
    }

    private static double inRange(double value, double min, double max, String label) {
        if (Double.isNaN(value) || value < min || value > max) {
            throw bad(label + " must be between " + (long) min + " and " + (long) max + ".");
        }
        return value;
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) throw bad("A date is required.");
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException error) {
            throw bad("Dates must look like YYYY-MM-DD.");
        }
    }

    public static double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public record PlanWindow(LocalDate start, LocalDate end) {
        public boolean contains(LocalDate date) {
            return !date.isBefore(start) && !date.isAfter(end);
        }

        public LocalDate require(String value) {
            LocalDate date = parseDate(value);
            if (!contains(date)) throw bad("Pick a day between " + start + " and " + end + ".");
            return date;
        }

        public PlanWindow narrow(String from, String to) {
            LocalDate first = from == null || from.isBlank() ? start : require(from);
            LocalDate last = to == null || to.isBlank() ? end : require(to);
            if (last.isBefore(first)) throw bad("The end date must be on or after the start date.");
            return new PlanWindow(first, last);
        }

        public List<LocalDate> days() {
            return start.datesUntil(end.plusDays(1)).toList();
        }
    }

    public record EntryDraft(String date, String mealType, Long mealId, String name, Double calories,
                             Double protein, Double carbs, Double fat, Double servings, String notes, Boolean prepared, Boolean eaten) {}

    public record PrepItem(String name, Long sourceMealId, double totalServings, double preparedServings,
                           long totalCalories, double totalProtein, double totalCarbs, double totalFat,
                           List<String> dates, List<Long> entryIds) {}

    private static final class PrepAccumulator {
        private final String name;
        private final Long sourceMealId;
        private double totalServings;
        private double preparedServings;
        private double calories;
        private double protein;
        private double carbs;
        private double fat;
        private final Set<String> dates = new LinkedHashSet<>();
        private final List<Long> entryIds = new ArrayList<>();

        PrepAccumulator(MealPlanEntry first) {
            this.name = first.getName();
            this.sourceMealId = first.getSourceMealId();
        }

        void add(MealPlanEntry entry) {
            double servings = entry.getServings();
            totalServings += servings;
            if (entry.isPrepared()) preparedServings += servings;
            calories += entry.getCalories() * servings;
            protein += entry.getProtein() * servings;
            carbs += entry.getCarbs() * servings;
            fat += entry.getFat() * servings;
            dates.add(entry.getPlanDate().toString());
            entryIds.add(entry.getId());
        }

        PrepItem toItem() {
            return new PrepItem(name, sourceMealId, round1(totalServings), round1(preparedServings),
                    Math.round(calories), round1(protein), round1(carbs), round1(fat),
                    List.copyOf(dates), List.copyOf(entryIds));
        }
    }
}
