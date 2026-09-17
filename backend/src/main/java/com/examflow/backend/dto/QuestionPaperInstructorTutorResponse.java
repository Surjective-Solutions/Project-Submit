package com.examflow.backend.dto;


public class QuestionPaperInstructorTutorResponse {
    
    private String id;

    private Integer subQuestionSeq;

    private Integer mainQuestionSeq;

    private Integer subSubQuestionSeq;

    private String question_label;

    private String parent_label;

    private Integer  max_marks;

    private Integer display_order;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getQuestion_label() {
        return question_label;
    }

    public void setQuestion_label(String question_label) {
        this.question_label = question_label;
    }

    public String getParent_label() {
        return parent_label;
    }

    public void setParent_label(String parent_label) {
        this.parent_label = parent_label;
    }

    public Integer getMax_marks() {
        return max_marks;
    }

    public void setMax_marks(Integer max_marks) {
        this.max_marks = max_marks;
    }

    public Integer getDisplay_order() {
        return display_order;
    }

    public void setDisplay_order(Integer display_order) {
        this.display_order = display_order;
    }

    public Integer getSubQuestionSeq() {
        return subQuestionSeq;
    }

    public void setSubQuestionSeq(Integer subQuestionSeq) {
        this.subQuestionSeq = subQuestionSeq;
    }

    public Integer getSubSubQuestionSeq() {
        return subSubQuestionSeq;
    }

    public void setSubSubQuestionSeq(Integer subSubQuestionSeq) {
        this.subSubQuestionSeq = subSubQuestionSeq;
    }

    public Integer getMainQuestionSeq() {
        return mainQuestionSeq;
    }

    public void setMainQuestionSeq(Integer mainQuestionSeq) {
        this.mainQuestionSeq = mainQuestionSeq;
    }

    

    


}