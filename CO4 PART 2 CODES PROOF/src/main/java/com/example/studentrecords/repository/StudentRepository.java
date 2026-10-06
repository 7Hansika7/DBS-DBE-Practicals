package com.example.studentrecords.repository;

import com.example.studentrecords.entity.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
}