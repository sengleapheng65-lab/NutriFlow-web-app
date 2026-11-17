package com.nutriflow.backend.controller;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.nutriflow.backend.model.MealPlanEntry;
import com.nutriflow.backend.model.User;
import com.nutriflow.backend.repository.UserRepository;
import com.nutriflow.backend.service.MealPlanService;
import com.nutriflow.backend.service.MealPlanService.EntryDraft;
import com.nutriflow.backend.service.MealPlanService.PlanWindow;
import com.nutriflow.backend.service.MealPlanService.PrepItem;

@RestController
@RequestMapping("/api/meal-plan")
public class MealPlanController {
    private static final String TIME_ZONE_HEADER = "X-Time-Zone";

    private final MealPlanService mealPlans;
    private final UserRepository users;

    public MealPlanController(MealPlanService mealPlans, UserRepository users) {
        this.mealPlans = mealPlans;
        this.users = users;
    }

    @GetMapping
    public PlanResponse getPlan(@RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone,
                                Authentication authentication) {
        User user = findUser(authentication);
        PlanWindow window = mealPlans.window(timeZone);

        Map<LocalDate, List<EntryResponse>> byDate = new HashMap<>();
        List<EntryResponse> all = new ArrayList<>();
        for (MealPlanEntry entry : mealPlans.entries(user, window.start(), window.end())) {
            EntryResponse response = response(entry);
            byDate.computeIfAbsent(entry.getPlanDate(), ignored -> new ArrayList<>()).add(response);
            all.add(response);
        }

        List<DayResponse> days = new ArrayList<>();
        for (LocalDate date : window.days()) {
            List<EntryResponse> dayEntries = byDate.getOrDefault(date, List.of());
            days.add(new DayResponse(date.toString(), date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                    dayEntries, totals(dayEntries)));
        }

        return new PlanResponse(window.start().toString(), window.end().toString(), MealPlanService.PLAN_DAYS,
                MealPlanService.MEAL_TYPES, days, totals(all));
    }

    @PostMapping("/entries")
    @ResponseStatus(HttpStatus.CREATED)
    public EntryResponse addEntry(@RequestBody EntryDraft request,
                                  @RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone, Authentication authentication) {
        User user = findUser(authentication);
        return response(mealPlans.create(user, mealPlans.window(timeZone), request));
    }

    @PutMapping("/entries/{id}")
    public EntryResponse updateEntry(@PathVariable Long id, @RequestBody EntryDraft request,
                                     @RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone, Authentication authentication) {
        User user = findUser(authentication);
        return response(mealPlans.update(user, id, mealPlans.window(timeZone), request));
    }

    @PostMapping("/entries/{id}/repeat")
    @ResponseStatus(HttpStatus.CREATED)
    public List<EntryResponse> repeatEntry(@PathVariable Long id, @RequestBody RepeatRequest request,
                                           @RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone, Authentication authentication) {
        User user = findUser(authentication);
        List<String> dates = request == null ? null : request.dates();
        return mealPlans.repeat(user, id, mealPlans.window(timeZone), dates).stream().map(this::response).toList();
    }

    @DeleteMapping("/entries/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(@PathVariable Long id, Authentication authentication) {
        mealPlans.delete(findUser(authentication), id);
    }

    @DeleteMapping("/days/{date}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearDay(@PathVariable String date,
                         @RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone, Authentication authentication) {
        User user = findUser(authentication);
        mealPlans.clearDay(user, mealPlans.window(timeZone), date);
    }

    @GetMapping("/prep-list")
    public PrepListResponse prepList(@RequestParam(required = false) String from,
                                     @RequestParam(required = false) String to,
                                     @RequestHeader(value = TIME_ZONE_HEADER, required = false) String timeZone, Authentication authentication) {
        User user = findUser(authentication);
        PlanWindow range = mealPlans.window(timeZone).narrow(from, to);
        return new PrepListResponse(range.start().toString(), range.end().toString(), mealPlans.prepList(user, range));
    }

    private User findUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow();
    }

    private EntryResponse response(MealPlanEntry entry) {
        return new EntryResponse(entry.getId(), entry.getPlanDate().toString(), entry.getMealType(), entry.getName(),
                entry.getCalories(), entry.getProtein(), entry.getCarbs(), entry.getFat(), entry.getServings(),
                entry.getNotes(), entry.isPrepared(), entry.isEaten(), entry.getSourceMealId());
    }

    private Totals totals(List<EntryResponse> entries) {
        double calories = 0, protein = 0, carbs = 0, fat = 0;
        for (EntryResponse entry : entries) {
            calories += entry.calories() * entry.servings();
            protein += entry.protein() * entry.servings();
            carbs += entry.carbs() * entry.servings();
            fat += entry.fat() * entry.servings();
        }
        return new Totals(Math.round(calories), MealPlanService.round1(protein),
                MealPlanService.round1(carbs), MealPlanService.round1(fat));
    }

    public record RepeatRequest(List<String> dates) {}

    public record EntryResponse(Long id, String date, String mealType, String name, int calories, double protein,
                                double carbs, double fat, double servings, String notes, boolean prepared, boolean eaten, Long sourceMealId) {}

    public record Totals(long calories, double protein, double carbs, double fat) {}

    public record DayResponse(String date, String dayOfWeek, List<EntryResponse> entries, Totals totals) {}

    public record PlanResponse(String startDate, String endDate, int days, List<String> mealTypes,
                               List<DayResponse> plan, Totals totals) {}

    public record PrepListResponse(String from, String to, List<PrepItem> items) {}
}
