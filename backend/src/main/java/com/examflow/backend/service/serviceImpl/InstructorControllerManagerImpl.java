package com.examflow.backend.service.serviceImpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.CashierResponse;
import com.examflow.backend.dto.InstructorResponse;
import com.examflow.backend.entity.Cashier;
import com.examflow.backend.entity.Instructor;
import com.examflow.backend.repository.InstructorRepository;
import com.examflow.backend.service.InstructorControllerManager;

@Service
public class InstructorControllerManagerImpl implements InstructorControllerManager {

    private final InstructorRepository instructorRepository;

    @Autowired
    public InstructorControllerManagerImpl(InstructorRepository instructorRepository) {
        this.instructorRepository = instructorRepository;
    }

    @Override
    public List<InstructorResponse> getAllInstructors() {

        List<Instructor> instructors = instructorRepository.findByStatus(2);

        List<InstructorResponse> instructorResponseList = new ArrayList<>();

        for (Instructor instructor : instructors) {

            InstructorResponse instructorResponse = new InstructorResponse();

            instructorResponse.setId(instructor.getInstructorSeq());
            instructorResponse.setEmployee_id(null);
            instructorResponse.setFirst_name(instructor.getFullName());
            instructorResponse.setLast_name(null);
            instructorResponse.setEmail(instructor.getEmail());
            instructorResponse.setContact_number(instructor.getContactNumber());
            instructorResponse.setSubject_area(null);
            instructorResponse.setStatus(instructor.getStatus());
            instructorResponse.setProfile_photo_url(null);

            instructorResponseList.add(instructorResponse);
        }

        return instructorResponseList;
    }

}
