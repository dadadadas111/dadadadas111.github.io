function setupPersonalOpsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const tabs = {
    logs_schedule: [
      'event_id','correlation_id','event_ts','date','day_type','source_bot','action','work_enabled','tutoring_enabled','tutoring_start','tutoring_end','growth_slot','english_slot','reset_slot','notes','telegram_message_id'
    ],
    logs_progress: [
      'event_id','correlation_id','event_ts','date','source_bot','entry_type','done','blocked','tomorrow','energy','weekly_score','wins','misses','next_top3','objective_ids','status_summary','telegram_message_id'
    ],
    logs_finance: [
      'event_id','correlation_id','event_ts','date','source_bot','raw_text','label','amount','currency','category','bucket','running_month_needs','running_month_wants','running_month_savings','telegram_message_id'
    ],
    weekly_summary: [
      'week_key','created_at','schedule_days_logged','tutoring_nights_count','growth_slots_count','progress_checkins_count','weekly_score_avg','green_count','yellow_count','red_count','finance_total_spent','finance_needs_pct','finance_wants_pct','finance_savings_pct','summary_note'
    ],
    monthly_summary: [
      'month_key','created_at','income_total','needs_total','wants_total','savings_total','needs_pct','wants_pct','savings_pct','progress_completion_avg','deep_work_days','tutoring_days','review_note'
    ],
    dim_lists: [
      'list_name','value','meta'
    ],
    error_log: [
      'event_id','correlation_id','error_ts','workflow_name','node_name','bot_name','severity','error_code','error_message','raw_payload_ref'
    ],
    dashboard: []
  };

  Object.entries(tabs).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();

    if (headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#1F2937')
        .setFontColor('#FFFFFF');
      sheet.autoResizeColumns(1, headers.length);
    }
  });

  seedDimLists_(ss.getSheetByName('dim_lists'));
  setupDashboard_(ss.getSheetByName('dashboard'));
}

function seedDimLists_(sheet) {
  const rows = [
    ['bots', 'schedule', ''],
    ['bots', 'progress', ''],
    ['bots', 'finance', ''],
    ['finance_bucket', 'needs', ''],
    ['finance_bucket', 'wants', ''],
    ['finance_bucket', 'savings', ''],
    ['progress_pillar', 'work', ''],
    ['progress_pillar', 'freelance', ''],
    ['progress_pillar', 'skill', ''],
    ['progress_pillar', 'English', ''],
    ['progress_pillar', 'health', ''],
    ['progress_pillar', 'life_admin', ''],
    ['goal_status', 'pending', ''],
    ['goal_status', 'in_progress', ''],
    ['goal_status', 'done', ''],
    ['goal_status', 'green', ''],
    ['goal_status', 'yellow', ''],
    ['goal_status', 'red', '']
  ];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  sheet.autoResizeColumns(1, 3);
}

function setupDashboard_(sheet) {
  sheet.getRange('A1').setValue('PERSONAL OPS DASHBOARD').setFontWeight('bold').setFontSize(16);

  sheet.getRange('A3').setValue('Weekly KPIs').setFontWeight('bold');
  sheet.getRange('A4').setValue('Tutoring nights this week');
  sheet.getRange('A5').setValue('Growth slots this week');
  sheet.getRange('A6').setValue('Check-ins this week');
  sheet.getRange('A7').setValue('Weekly score avg');

  sheet.getRange('B4').setFormula('=IFERROR(INDEX(weekly_summary!D:D, MATCH(MAX(FILTER(ROW(weekly_summary!A:A), weekly_summary!A:A<>"")), ROW(weekly_summary!A:A), 0)), "")');
  sheet.getRange('B5').setFormula('=IFERROR(INDEX(weekly_summary!E:E, MATCH(MAX(FILTER(ROW(weekly_summary!A:A), weekly_summary!A:A<>"")), ROW(weekly_summary!A:A), 0)), "")');
  sheet.getRange('B6').setFormula('=IFERROR(INDEX(weekly_summary!F:F, MATCH(MAX(FILTER(ROW(weekly_summary!A:A), weekly_summary!A:A<>"")), ROW(weekly_summary!A:A), 0)), "")');
  sheet.getRange('B7').setFormula('=IFERROR(INDEX(weekly_summary!G:G, MATCH(MAX(FILTER(ROW(weekly_summary!A:A), weekly_summary!A:A<>"")), ROW(weekly_summary!A:A), 0)), "")');

  sheet.getRange('D3').setValue('Monthly KPIs').setFontWeight('bold');
  sheet.getRange('D4').setValue('Income total');
  sheet.getRange('D5').setValue('Needs %');
  sheet.getRange('D6').setValue('Wants %');
  sheet.getRange('D7').setValue('Savings %');

  sheet.getRange('E4').setFormula('=IFERROR(INDEX(monthly_summary!C:C, MATCH(MAX(FILTER(ROW(monthly_summary!A:A), monthly_summary!A:A<>"")), ROW(monthly_summary!A:A), 0)), "")');
  sheet.getRange('E5').setFormula('=IFERROR(INDEX(monthly_summary!G:G, MATCH(MAX(FILTER(ROW(monthly_summary!A:A), monthly_summary!A:A<>"")), ROW(monthly_summary!A:A), 0)), "")');
  sheet.getRange('E6').setFormula('=IFERROR(INDEX(monthly_summary!H:H, MATCH(MAX(FILTER(ROW(monthly_summary!A:A), monthly_summary!A:A<>"")), ROW(monthly_summary!A:A), 0)), "")');
  sheet.getRange('E7').setFormula('=IFERROR(INDEX(monthly_summary!I:I, MATCH(MAX(FILTER(ROW(monthly_summary!A:A), monthly_summary!A:A<>"")), ROW(monthly_summary!A:A), 0)), "")');

  sheet.getRange('A10').setValue('Notes').setFontWeight('bold');
  sheet.getRange('A11').setValue('Create charts manually from weekly_summary and monthly_summary after first data arrives.');
  sheet.autoResizeColumns(1, 6);
}
