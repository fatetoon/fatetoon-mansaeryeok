/* ===== FATETOON 만세력 - 최종본 =====
   - 절입일(대략값) 보정 + 인월기준 월간표 + JDN 일주 + 일간/시간 시주
   - 시간 드롭다운 value는 지지 인덱스(자=0 … 해=11)로 구성 필수
   - 검증: 
     1995-02-14 17:00 → 을해 / 무인 / 병자 / 병신
     2001-08-07 13:00 → 신사 / 을미 / 임인 / 정미
     1974-12-17 18:00 → 갑인 / 병자 / 임진 / 기유
     2004-01-28 04:28 → 계미 / 을축 / 병오 / 경인
     2003-12-11 08:00 → 계미 / 갑자 / 무오 / 병진
*/

function calculateSaju() {
  const birthStr = document.getElementById("birthdate").value;
  const hourBranchIndex = parseInt(document.getElementById("birthtime").value); // 0~11
  const resultEl = document.getElementById("result");

  if (!birthStr) {
    resultEl.innerHTML = "⚠️ 생년월일을 입력해주세요.";
    return;
  }

  // 입력 날짜 (양력, 로컬)
  const birthDate = new Date(birthStr + "T12:00:00"); // 타임존 오차 방지용 정오 고정
  const y = birthDate.getFullYear();
  const m = birthDate.getMonth() + 1;
  const d = birthDate.getDate();

  const stems = ["갑","을","병","정","무","기","경","신","임","계"];
  const branches12 = ["자","축","인","묘","진","사","오","미","신","유","술","해"];

  // ========== 1) 년주 (입춘 전이면 전년)
  const adjYear = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
  const yearStem = stems[(adjYear - 4) % 10];
  const yearBranch = branches12[(adjYear - 4) % 12];
  const yearGanji = yearStem + yearBranch;

  // ========== 2) 월주
  // 절기 경계(대략값, 한국 기준). 이 값들은 "그 달의 절입일" 대략 기준.
  const boundaries = {2:4,3:6,4:5,5:6,6:6,7:7,8:8,9:8,10:8,11:7,12:7,1:6};
  // 인월(寅)을 0으로 두는 월지 인덱스 맵
  const monthOrder = {2:0,3:1,4:2,5:3,6:4,7:5,8:6,9:7,10:8,11:9,12:10,1:11};

  let monthBranchIdx; // 0=寅 … 11=丑
  if (m === 1 && d < boundaries[1]) {
    monthBranchIdx = 11; // 입춘 전의 1월은 '축'
  } else {
    // 경계일 이전이면 전달 월지, 아니면 당월 월지
    const usePrev = (d < boundaries[m]);
    const key = usePrev ? (m > 1 ? m - 1 : 12) : m;
    monthBranchIdx = monthOrder[key];
  }
  // 월지 한글 (寅부터 시작 배열)
  const monthBranches = ["인","묘","진","사","오","미","신","유","술","해","자","축"];
  const monthBranch = monthBranches[monthBranchIdx];

  // 인월(月干) 기준표: 연간에 따라 인월의 월간이 정해짐
  // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
  const yearStemIdx = (adjYear - 4) % 10; // 0:갑 … 9:계
  let tigerStemIdx; // 인월(月干) 천간 인덱스
  if (yearStemIdx === 0 || yearStemIdx === 5) tigerStemIdx = 2;   // 丙
  else if (yearStemIdx === 1 || yearStemIdx === 6) tigerStemIdx = 4; // 戊
  else if (yearStemIdx === 2 || yearStemIdx === 7) tigerStemIdx = 6; // 庚
  else if (yearStemIdx === 3 || yearStemIdx === 8) tigerStemIdx = 8; // 壬
  else tigerStemIdx = 0; // yearStemIdx === 4 || 9 → 甲

  const monthStem = stems[(tigerStemIdx + monthBranchIdx) % 10];
  const monthGanji = monthStem + monthBranch;

  // ========== 3) 일주 (JDN 기준)
  const dayGanji = getDayGanjiJDN(y, m, d, stems, branches12);

  // ========== 4) 시주 (일간+시간 공식)
  const dayStemIdx = stems.indexOf(dayGanji[0]); // 일간 인덱스
  const hourStemIdx = (dayStemIdx * 2 + hourBranchIndex) % 10;
  const hourGanji = stems[hourStemIdx] + branches12[hourBranchIndex];

  // 출력
  resultEl.innerHTML = `
    <h3>🌕 당신의 사주 결과</h3>
    <p>년주: ${yearGanji}</p>
    <p>월주: ${monthGanji}</p>
    <p>일주: ${dayGanji}</p>
    <p>시주: ${hourGanji}</p>
  `;
}

/* ===== Julian Day 기반 일주 계산 (정확도 검증 완료) ===== */
function getDayGanjiJDN(y, m, d, stems, branches) {
  const jdnBase = JD(1984, 2, 2); // 1984-02-02 (갑자일) 기준
  const j = JD(y, m, d);
  const idx = (j - jdnBase + 2) % 60; // 오프셋 2 보정
  return stems[idx % 10] + branches[idx % 12];
}

// Gregorian Julian Day Number
function JD(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4)
       - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}
