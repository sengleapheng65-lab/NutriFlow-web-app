package com.nutriflow.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.JoinColumn;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user", uniqueConstraints = @UniqueConstraint(name = "uk_app_user_email", columnNames = "email"))
/** Persistent account and profile data. Password values are BCrypt hashes, never plain text. */
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    @Column(nullable = false)
    private String email;
    private String password;
    private String bio;
    private String age;
    private String gender;
    private String height;
    private String weight;
    private String activityLevel;
    @Lob
    private String photo;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_dietary_restrictions", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "restriction")
    private List<String> dietaryRestrictions = new ArrayList<>();

    protected User() {}

    public User(String fullName, String email, String password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getBio() { return bio; }
    public String getAge() { return age; }
    public String getGender() { return gender; }
    public String getHeight() { return height; }
    public String getWeight() { return weight; }
    public String getActivityLevel() { return activityLevel; }
    public String getPhoto() { return photo; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setBio(String bio) { this.bio = bio; }
    public void setAge(String age) { this.age = age; }
    public void setGender(String gender) { this.gender = gender; }
    public void setHeight(String height) { this.height = height; }
    public void setWeight(String weight) { this.weight = weight; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
    public void setPhoto(String photo) { this.photo = photo; }

    public List<String> getDietaryRestrictions() { return dietaryRestrictions; }
    public void setDietaryRestrictions(List<String> restrictions) {
        dietaryRestrictions.clear();
        dietaryRestrictions.addAll(restrictions);
    }
}
