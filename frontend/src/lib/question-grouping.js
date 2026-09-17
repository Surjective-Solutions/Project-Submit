// Groups a flat list of rows (each with a `question_id` shaped like "5",
// "5(a)", or "5(a)(i)") into a nested tree — question -> subparts ->
// subsubparts — so grade tables can render proper visual hierarchy instead
// of a flat list. Mirrors the grouping logic used on the tutor's Mark Entry
// page, kept here as a shared util since both the student grade breakdown
// and detailed feedback pages need the same tree.

function parseQuestionId(id) {
  const match = String(id).match(/^(\d+)(?:\(([a-z]+)\))?(?:\(([ivxlcdm]+)\))?$/i);
  if (!match) return null;
  const [, qNum, letter, roman] = match;
  return { qNum, letter: letter || null, roman: roman || null };
}

export function groupQuestionRows(rows) {
  const order = [];
  const map = new Map();

  for (const row of rows ?? []) {
    const parsed = parseQuestionId(row.question_id);
    if (!parsed) continue;
    const { qNum, letter, roman } = parsed;

    if (!map.has(qNum)) {
      map.set(qNum, { key: qNum, self: null, subOrder: [], subMap: new Map() });
      order.push(qNum);
    }
    const qEntry = map.get(qNum);

    if (!letter) {
      qEntry.self = row;
      continue;
    }

    if (!qEntry.subMap.has(letter)) {
      qEntry.subMap.set(letter, { key: `${qNum}(${letter})`, self: null, subsubparts: [] });
      qEntry.subOrder.push(letter);
    }
    const spEntry = qEntry.subMap.get(letter);

    if (!roman) {
      spEntry.self = row;
    } else {
      spEntry.subsubparts.push(row);
    }
  }

  return order.map((qNum) => {
    const qEntry = map.get(qNum);
    return {
      key: qEntry.key,
      self: qEntry.self,
      subparts: qEntry.subOrder.map((letter) => {
        const sp = qEntry.subMap.get(letter);
        return { key: sp.key, self: sp.self, subsubparts: sp.subsubparts };
      }),
    };
  });
}

function sumLeaf(row) {
  return { awarded: row.marks_awarded ?? 0, max: row.max_marks ?? 0 };
}

function addTotals(a, b) {
  return { awarded: a.awarded + b.awarded, max: a.max + b.max };
}

export function sumSubpart(sp) {
  if (sp.subsubparts.length > 0) {
    return sp.subsubparts.reduce((acc, row) => addTotals(acc, sumLeaf(row)), { awarded: 0, max: 0 });
  }
  return sp.self ? sumLeaf(sp.self) : { awarded: 0, max: 0 };
}

export function sumQuestion(q) {
  if (q.subparts.length > 0) {
    return q.subparts.reduce((acc, sp) => addTotals(acc, sumSubpart(sp)), { awarded: 0, max: 0 });
  }
  return q.self ? sumLeaf(q.self) : { awarded: 0, max: 0 };
}