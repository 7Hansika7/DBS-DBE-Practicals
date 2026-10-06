package com.example.studentrecords.service;

import com.example.studentrecords.dto.StudentRequest;
import com.example.studentrecords.entity.Student;
import com.example.studentrecords.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    private final StudentRepository repository;

    public StudentService(StudentRepository repository) {
        this.repository = repository;
    }

    public Student create(StudentRequest r) {
        Student s = new Student();
        apply(s, r);
        return repository.save(s);
    }

    public List<Student> getAll() {
        return repository.findAll();
    }

    public Optional<Student> getById(String id) {
        return repository.findById(id);
    }

    public Optional<Student> update(String id, StudentRequest r) {
        return repository.findById(id).map(s -> {
            apply(s, r);
            return repository.save(s);
        });
    }

    public boolean delete(String id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    private void apply(Student s, StudentRequest r) {
        s.setName(r.getName());
        s.setAge(r.getAge());
        s.setCourse(r.getCourse());
        s.setEmail(r.getEmail());
    }
}