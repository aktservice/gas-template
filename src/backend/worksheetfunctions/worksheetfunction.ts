function onEdit(evt) {
  const CONSTANT_VALUES = {
    CONFIGSHEETNAME: "config",
    CONFIGRNG: { URLRNG: "A2" },
    WEBAPP_PRAM: {
      SHEET_ID: "sheetId",
      SHEET_COL_INDEX: "sheetColIndex",
      SHEET_ROW_INDEX: "sheetRowIndex",
    },
    TARGET_COLUMN: 13,
    EVFIRE_COLUMN: 12,
    TARGET_MIN_ROW: 2,
    RESULT_COLUMN: 14,
    FIRE_VALUE: "現物あり",
    NOTFIRE_VALUE: "現物なし",
  };

  const rng = evt.range;
  const val = rng.getValue();
  const col = rng.getColumn();
  const row = rng.getRow();
  if (
    row > CONSTANT_VALUES.TARGET_MIN_ROW &&
    col === CONSTANT_VALUES.EVFIRE_COLUMN &&
    val === CONSTANT_VALUES.FIRE_VALUE
  ) {
    const sheetId = rng.getSheet().getSheetId();
    const url = evt.source
      .getSheetByName(CONSTANT_VALUES.CONFIGSHEETNAME)
      .getRange(CONSTANT_VALUES.CONFIGRNG.URLRNG)
      .getValue();

    const formula = `=HYPERLINK("${url}?${CONSTANT_VALUES.WEBAPP_PRAM.SHEET_ID}=${sheetId}&${CONSTANT_VALUES.WEBAPP_PRAM.SHEET_COL_INDEX}=${CONSTANT_VALUES.RESULT_COLUMN}&${CONSTANT_VALUES.WEBAPP_PRAM.SHEET_ROW_INDEX}=${row}","📸")`;
    rng.offset(0, 1).setFontSize(26);
    rng.offset(0, 1).setFormula(formula);
  } else if (val === CONSTANT_VALUES.NOTFIRE_VALUE || val === "") {
    rng.offset(0, 1).setFontSize(11);
    rng.offset(0, 1).setValue(null);
  }
}
