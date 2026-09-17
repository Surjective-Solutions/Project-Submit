package com.examflow.backend.dto;

public class SubmitGradeQuestionsResponse {
    

    private String questionId;

    private Integer marksAwarded;

    private String comment;

    private Boolean isSubQuestion;

    private Boolean isSubSubQuestion;

    private Integer subquestionSeq;

    private Integer subsubquestionSeq;

    private Integer mainQuestionSeq;

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public Integer getMarksAwarded() {
        return marksAwarded;
    }

    public void setMarksAwarded(Integer marksAwarded) {
        this.marksAwarded = marksAwarded;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Boolean getIsSubQuestion() {
        return isSubQuestion;
    }

    public void setIsSubQuestion(Boolean isSubQuestion) {
        this.isSubQuestion = isSubQuestion;
    }

    public Integer getSubquestionSeq() {
        return subquestionSeq;
    }

    public void setSubquestionSeq(Integer subquestionSeq) {
        this.subquestionSeq = subquestionSeq;
    }
    
    public Boolean getIsSubSubQuestion() {
        return isSubSubQuestion;
    }

    public void setIsSubSubQuestion(Boolean isSubSubQuestion) {
        this.isSubSubQuestion = isSubSubQuestion;
    }

    public Integer getSubsubquestionSeq() {
        return subsubquestionSeq;
    }

    public void setSubsubquestionSeq(Integer subsubquestionSeq) {
        this.subsubquestionSeq = subsubquestionSeq;
    }

    public Integer getMainQuestionSeq() {
        return mainQuestionSeq;
    }

    public void setMainQuestionSeq(Integer mainQuestionSeq) {
        this.mainQuestionSeq = mainQuestionSeq;
    }

    


    
}
