package com.examflow.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.UploadPaperQuestionSubQuestion;
import com.examflow.backend.entity.UploadPaperQuestionSubSubQuestion;

public interface UploadPaperQuestionSubSubQuestionRepository
        extends JpaRepository<UploadPaperQuestionSubSubQuestion, Integer> {


                 List<UploadPaperQuestionSubSubQuestion> findByUploadPaperQuestionSubQuestionAndStatus(UploadPaperQuestionSubQuestion uploadPaperQuestionSubQuestion,Integer statuSeq);

                 UploadPaperQuestionSubSubQuestion findByUploadPaperQuestionSubSubQuestionSeq(Integer uploadPaperQuestionSubSubQuestionSeq);

                 List<UploadPaperQuestionSubSubQuestion> findByUploadPaperQuestionSubQuestionAndStatusOrderByQuestionKeyAsc(UploadPaperQuestionSubQuestion uploadPaperQuestionSubQuestion,Integer statuSeq);
}