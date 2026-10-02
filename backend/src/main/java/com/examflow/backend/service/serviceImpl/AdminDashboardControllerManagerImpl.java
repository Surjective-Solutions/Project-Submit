package com.examflow.backend.service.serviceImpl;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.examflow.backend.dto.SlipQueueItemResponse;
import com.examflow.backend.dto.SlipQueueResponse;
import com.examflow.backend.dto.SlipsToVerifyResponse;
import com.examflow.backend.dto.StreamCountResponse;
import com.examflow.backend.dto.StudentSummaryResponse;
import com.examflow.backend.dto.StudentsByStreamResponse;
import com.examflow.backend.entity.ClassPaymentRecord;
import com.examflow.backend.entity.Classes;
import com.examflow.backend.entity.Student;
import com.examflow.backend.entity.StudentClassPaymentRecord;
import com.examflow.backend.repository.StudentClassPaymentRecordsRepository;
import com.examflow.backend.repository.StudentRepository;
import com.examflow.backend.service.AdminDashboardControllerManager;

@Service
public class AdminDashboardControllerManagerImpl implements AdminDashboardControllerManager {

    // Students with this status can log in; it is set on signup approval.
    private static final Integer ACTIVE_STUDENT_STATUS = 2;

    // The academy runs on Sri Lanka time, so "this month" starts at midnight Colombo time.
    private static final ZoneId ACADEMY_ZONE = ZoneId.of("Asia/Colombo");

    // A payment record stays at this status while it is open; rejecting a slip moves it to REJECTED.
    private static final Integer OPEN_PAYMENT_RECORD_STATUS = 2;

    // The dashboard only previews the queue; the full list lives on the payments page.
    private static final int MAX_SLIP_QUEUE_SIZE = 20;

    // Label for active students who never picked a subject stream.
    private static final String UNSPECIFIED_STREAM = "Not specified";

    private final StudentRepository studentRepository;

    private final StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository;

    @Autowired
    public AdminDashboardControllerManagerImpl(StudentRepository studentRepository,
            StudentClassPaymentRecordsRepository studentClassPaymentRecordsRepository) {
        this.studentRepository = studentRepository;
        this.studentClassPaymentRecordsRepository = studentClassPaymentRecordsRepository;
    }

    @Override
    public StudentSummaryResponse getStudentSummary() {
        
        LocalDateTime startOfMonth = LocalDate.now(ACADEMY_ZONE).withDayOfMonth(1).atStartOfDay();

        StudentSummaryResponse response = new StudentSummaryResponse();
        response.setActive(studentRepository.countByStatus(ACTIVE_STUDENT_STATUS));
        response.setNewThisMonth(
                studentRepository.countByStatusAndRegisterDateTimeGreaterThanEqual(ACTIVE_STUDENT_STATUS, startOfMonth));
        return response;
    }

    @Override
    public SlipsToVerifyResponse getSlipsToVerify() {

        // A slip awaits review once the student uploads it (isForPayments) and until an
        // admin approves (isApproved = true) or rejects it (status moves to REJECTED).
        SlipsToVerifyResponse response = new SlipsToVerifyResponse();
        response.setPending(studentClassPaymentRecordsRepository
                .countByStatusAndIsForPaymentsAndIsApprovedIsNull(OPEN_PAYMENT_RECORD_STATUS, true));

        StudentClassPaymentRecord oldest = studentClassPaymentRecordsRepository
                .findTopByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(OPEN_PAYMENT_RECORD_STATUS, true);

        response.setOldestWaitingMinutes(oldest != null ? waitingMinutes(oldest) : 0L);
        return response;
    }

    @Override
    public SlipQueueResponse getSlipQueue(Integer limit) {

        // Oldest first: that is the order the admin should work through the queue.
        int pageSize = Math.min(Math.max(limit, 1), MAX_SLIP_QUEUE_SIZE);
        List<StudentClassPaymentRecord> pendingSlips = studentClassPaymentRecordsRepository
                .findByStatusAndIsForPaymentsAndIsApprovedIsNullOrderByPayedTimeAsc(OPEN_PAYMENT_RECORD_STATUS, true,
                        PageRequest.of(0, pageSize));

        List<SlipQueueItemResponse> slips = new ArrayList<>();
        for (StudentClassPaymentRecord paymentRecord : pendingSlips) {
            Student student = paymentRecord.getStudent();
            ClassPaymentRecord classPaymentRecord = paymentRecord.getClassPaymentRecord();
            Classes classes = classPaymentRecord.getClasses();

            SlipQueueItemResponse slip = new SlipQueueItemResponse();
            slip.setId(paymentRecord.getStudentClassPaymentRecordSeq());
            slip.setStudentName(student.getFirstName() + " " + student.getLastName());
            slip.setStudentNo(student.getStudentNo());
            slip.setClassName(classes.getDisplayName());
            slip.setTutorName(classes.getTutor() != null ? classes.getTutor().getName() : null);
            slip.setMonth(classPaymentRecord.getMonth());
            slip.setYear(classPaymentRecord.getYear());
            slip.setAmount(paymentRecord.getPayedAmount());
            slip.setWaitingMinutes(waitingMinutes(paymentRecord));
            slips.add(slip);
        }

        SlipQueueResponse response = new SlipQueueResponse();
        response.setTotal(studentClassPaymentRecordsRepository
                .countByStatusAndIsForPaymentsAndIsApprovedIsNull(OPEN_PAYMENT_RECORD_STATUS, true));
        response.setSlips(slips);
        return response;
    }

    @Override
    public StudentsByStreamResponse getStudentsByStream() {

        // Older sign-ups may have no stream; fold null and blank values into one bucket
        // so they don't show up as separate empty-named rows.
        Map<String, Long> countsByStream = new LinkedHashMap<>();
        for (StreamCountResponse row : studentRepository.countByStreamForStatus(ACTIVE_STUDENT_STATUS)) {
            String stream = row.getStream() == null || row.getStream().isBlank()
                    ? UNSPECIFIED_STREAM
                    : row.getStream().trim();
            countsByStream.merge(stream, row.getCount(), Long::sum);
        }

        // Largest stream first; "Not specified" always goes last.
        List<StreamCountResponse> streams = new ArrayList<>();
        countsByStream.forEach((stream, count) -> streams.add(new StreamCountResponse(stream, count)));
        streams.sort(Comparator
                .comparing((StreamCountResponse s) -> UNSPECIFIED_STREAM.equals(s.getStream()))
                .thenComparing(StreamCountResponse::getCount, Comparator.reverseOrder()));

        StudentsByStreamResponse response = new StudentsByStreamResponse();
        response.setTotal(countsByStream.values().stream().mapToLong(Long::longValue).sum());
        response.setStreams(streams);
        return response;
    }

    // payedTime is stamped with the server's local clock, so measure the wait against the same clock.
    private long waitingMinutes(StudentClassPaymentRecord paymentRecord) {
        if (paymentRecord.getPayedTime() == null) {
            return 0L;
        }
        long minutes = Duration.between(paymentRecord.getPayedTime(), LocalDateTime.now()).toMinutes();
        return Math.max(minutes, 0);
    }
}
