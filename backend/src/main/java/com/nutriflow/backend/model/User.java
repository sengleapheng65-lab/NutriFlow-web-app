package com.nutriflow.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Lob;

@Entity
@Table(name = "app_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
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
}
