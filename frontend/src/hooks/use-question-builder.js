'use client';

import { useRef, useState } from 'react';

export const QUESTION_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

const ROMAN_NUMERAL_MAP = [
  [1000, 'm'], [900, 'cm'], [500, 'd'], [400, 'cd'],
  [100, 'c'], [90, 'xc'], [50, 'l'], [40, 'xl'],
  [10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i'],
];

// Lowercase roman numerals for the third question level (i, ii, iii, iv, ...).
// Caps out gracefully rather than throwing for absurdly large inputs — a paper
// is never going to have 4000 sub-subparts, but better a garbled label than a crash.
export function toRoman(num) {
  let result = '';
  let n = num;
  for (const [value, symbol] of ROMAN_NUMERAL_MAP) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }
  return result || String(num);
}

function isValidMarks(value) {
  return value !== '' && Number(value) > 0;
}

// Labels are now strictly "1", "1(a)", or "1(a)(i)" (no "Q" prefix) — deterministic
// enough that we can parse the hierarchy straight back out of the label string
// rather than needing an extra backend field to carry grandparent info.
function parseQuestionLabel(label) {
  const match = String(label).match(/^(\d+)(?:\(([a-z]+)\))?(?:\(([ivxlcdm]+)\))?$/i);
  if (!match) return null;
  const [, qNum, letter, roman] = match;
  return { qNum: Number(qNum), letter: letter || null, roman: roman || null };
}

function questionsToBuilderState(questions) {
  if (!questions || questions.length === 0) return [];
  const sorted = [...questions].sort((a, b) => a.display_order - b.display_order);

  let localKey = 0;
  const nextLocalKey = () => localKey++;

  const qOrder = [];
  const qMap = new Map(); // qNum -> { key, marks, subpartOrder: [], subpartMap: Map(letter -> {...}) }

  for (const q of sorted) {
    const parsed = parseQuestionLabel(q.question_label);
    if (!parsed) continue;
    const { qNum, letter, roman } = parsed;

    if (!qMap.has(qNum)) {
      qMap.set(qNum, { key: nextLocalKey(), marks: '', subpartOrder: [], subpartMap: new Map() });
      qOrder.push(qNum);
    }
    const qEntry = qMap.get(qNum);

    if (!letter) {
      qEntry.marks = String(q.max_marks);
      continue;
    }

    if (!qEntry.subpartMap.has(letter)) {
      qEntry.subpartMap.set(letter, { key: nextLocalKey(), marks: '', subsubparts: [] });
      qEntry.subpartOrder.push(letter);
    }
    const spEntry = qEntry.subpartMap.get(letter);

    if (!roman) {
      spEntry.marks = String(q.max_marks);
    } else {
      spEntry.subsubparts.push({ key: nextLocalKey(), marks: String(q.max_marks) });
    }
  }

  return qOrder.map((qNum) => {
    const qEntry = qMap.get(qNum);
    return {
      key: qEntry.key,
      marks: qEntry.marks,
      subparts: qEntry.subpartOrder.map((letter) => {
        const sp = qEntry.subpartMap.get(letter);
        return { key: sp.key, marks: sp.marks, subsubparts: sp.subsubparts };
      }),
    };
  });
}

export function useQuestionBuilder(initialQuestions) {
  const keyRef = useRef(0);

  function makeKey() {
    keyRef.current += 1;
    return keyRef.current;
  }

  const [questions, setQuestions] = useState(() => questionsToBuilderState(initialQuestions));
  const [showErrors, setShowErrors] = useState(false);

  function reset(nextInitial = []) {
    setQuestions(questionsToBuilderState(nextInitial));
    setShowErrors(false);
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, { key: makeKey(), marks: '', subparts: [] }]);
  }

  function removeQuestion(qi) {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  }

  function changeQuestionMarks(qi, value) {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, marks: value } : q)));
  }

  function addSubpart(qi) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, marks: '', subparts: [...q.subparts, { key: makeKey(), marks: '', subsubparts: [] }] }
          : q
      )
    );
  }

  function removeSubpart(qi, si) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, subparts: q.subparts.filter((_, j) => j !== si) } : q))
    );
  }

  function changeSubpartMarks(qi, si, value) {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, subparts: q.subparts.map((sp, j) => (j === si ? { ...sp, marks: value } : sp)) }
          : q
      )
    );
  }

  function addSubSubpart(qi, si) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              subparts: q.subparts.map((sp, j) =>
                j === si
                  ? { ...sp, marks: '', subsubparts: [...sp.subsubparts, { key: makeKey(), marks: '' }] }
                  : sp
              ),
            }
          : q
      )
    );
  }

  function removeSubSubpart(qi, si, ssi) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              subparts: q.subparts.map((sp, j) =>
                j === si ? { ...sp, subsubparts: sp.subsubparts.filter((_, k) => k !== ssi) } : sp
              ),
            }
          : q
      )
    );
  }

  function changeSubSubpartMarks(qi, si, ssi, value) {
    if (value !== '' && !/^\d*$/.test(value)) return;
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? {
              ...q,
              subparts: q.subparts.map((sp, j) =>
                j === si
                  ? {
                      ...sp,
                      subsubparts: sp.subsubparts.map((ssp, k) => (k === ssi ? { ...ssp, marks: value } : ssp)),
                    }
                  : sp
              ),
            }
          : q
      )
    );
  }

  function sumMarks(q) {
    if (q.subparts.length > 0) {
      return q.subparts.reduce((s, sp) => {
        if (sp.subsubparts.length > 0) {
          return s + sp.subsubparts.reduce((ss, ssp) => ss + (Number(ssp.marks) || 0), 0);
        }
        return s + (Number(sp.marks) || 0);
      }, 0);
    }
    return Number(q.marks) || 0;
  }

  const totalMarks = questions.reduce((sum, q) => sum + sumMarks(q), 0);

  function validate() {
    if (questions.length === 0) return 'Add at least one question.';
    for (const q of questions) {
      if (q.subparts.length > 0) {
        for (const sp of q.subparts) {
          if (sp.subsubparts.length > 0) {
            if (sp.subsubparts.some((ssp) => !isValidMarks(ssp.marks))) {
              return 'Enter valid marks for every part.';
            }
          } else if (!isValidMarks(sp.marks)) {
            return 'Enter valid marks for every part.';
          }
        }
      } else if (!isValidMarks(q.marks)) {
        return 'Enter valid marks for every question.';
      }
    }
    return null;
  }

  // Flat, backend-shaped preview of the structure (not currently sent over the
  // wire — both upload/edit dialogs submit the raw `questions` state directly —
  // but kept in sync in case something downstream starts consuming it).
  function buildPayload() {
    const result = [];
    let order = 1;
    questions.forEach((q, qi) => {
      const qNum = qi + 1;
      if (q.subparts.length > 0) {
        q.subparts.forEach((sp, si) => {
          const letter = QUESTION_LETTERS[si];
          if (sp.subsubparts.length > 0) {
            sp.subsubparts.forEach((ssp, ssi) => {
              result.push({
                question_label: `${qNum}(${letter})(${toRoman(ssi + 1)})`,
                parent_label: `${qNum}(${letter})`,
                max_marks: Number(ssp.marks),
                display_order: order++,
              });
            });
          } else {
            result.push({
              question_label: `${qNum}(${letter})`,
              parent_label: `${qNum}`,
              max_marks: Number(sp.marks),
              display_order: order++,
            });
          }
        });
      } else {
        result.push({
          question_label: `${qNum}`,
          parent_label: null,
          max_marks: Number(q.marks),
          display_order: order++,
        });
      }
    });
    return result;
  }

  function submit() {
    const error = validate();
    if (error) {
      setShowErrors(true);
      return { error };
    }
    return { error: null, payload: buildPayload(), count: questions.length };
  }

  return {
    questions,
    showErrors,
    totalMarks,
    error: showErrors ? validate() : null,
    addQuestion,
    removeQuestion,
    changeQuestionMarks,
    addSubpart,
    removeSubpart,
    changeSubpartMarks,
    addSubSubpart,
    removeSubSubpart,
    changeSubSubpartMarks,
    submit,
    reset,
  };
}