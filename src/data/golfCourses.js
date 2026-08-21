/* ===== 전국 골프장 디렉터리 (정적 데이터) =====
 * 골프장 전용 상용 API는 대부분 해외 코스 위주 + 유료이고,
 * 국내 지역 검색 API는 브라우저에서 CORS 제약이 있어
 * 공개된 골프장 현황 정보를 앱에 내장하는 방식을 택했다.
 *
 * ⚠️ lat/lon 은 시·군·구 단위 근사 좌표다.
 *    OpenWeatherMap 무료 플랜은 격자 보간 값을 주므로 날씨 조회 목적에는 충분하지만,
 *    코스 내 홀 단위 위치를 나타내지는 않는다.
 *    정확한 공식 데이터가 필요하면 scripts/convertGolfCourses.mjs 참고.
 *
 * type : '대중제'(퍼블릭) | '회원제'(멤버십)
 */
export const GOLF_COURSES = [
  // ===== 기본 대시보드 10곳 (지역 대표) =====
  { id: 'cc_01', name: '남서울CC', region: '경기', city: '성남시', holes: 18, type: '회원제', lat: 37.4009, lon: 127.1119 },
  { id: 'cc_02', name: '라데나GC', region: '강원', city: '춘천시', holes: 27, type: '대중제', lat: 37.8813, lon: 127.73 },
  { id: 'cc_03', name: '해운대CC', region: '부산', city: '해운대구', holes: 18, type: '회원제', lat: 35.1796, lon: 129.1756 },
  { id: 'cc_04', name: '경주신라CC', region: '경북', city: '경주시', holes: 27, type: '대중제', lat: 35.8562, lon: 129.2247 },
  { id: 'cc_05', name: '핀크스GC', region: '제주', city: '서귀포시', holes: 18, type: '회원제', lat: 33.3241, lon: 126.3601 },
  { id: 'cc_06', name: '알펜시아CC', region: '강원', city: '평창군', holes: 18, type: '대중제', lat: 37.6653, lon: 128.6797 },
  { id: 'cc_07', name: '무등산CC', region: '광주', city: '북구', holes: 18, type: '회원제', lat: 35.1595, lon: 126.9526 },
  { id: 'cc_08', name: '유성CC', region: '대전', city: '유성구', holes: 18, type: '회원제', lat: 36.3604, lon: 127.3345 },
  { id: 'cc_09', name: '클럽72', region: '인천', city: '중구', holes: 72, type: '대중제', lat: 37.4563, lon: 126.4452 },
  { id: 'cc_10', name: '울산CC', region: '울산', city: '울주군', holes: 18, type: '회원제', lat: 35.5384, lon: 129.2114 },

  // ===== 수도권 =====
  { id: 'cc_11', name: '태릉CC', region: '서울', city: '노원구', holes: 18, type: '회원제', lat: 37.63, lon: 127.08 },
  { id: 'cc_12', name: '한양CC', region: '경기', city: '고양시', holes: 36, type: '회원제', lat: 37.66, lon: 126.8 },
  { id: 'cc_13', name: '뉴코리아CC', region: '경기', city: '고양시', holes: 27, type: '회원제', lat: 37.68, lon: 126.83 },
  { id: 'cc_14', name: '안양CC', region: '경기', city: '군포시', holes: 18, type: '회원제', lat: 37.36, lon: 126.935 },
  { id: 'cc_15', name: '레이크사이드CC', region: '경기', city: '용인시', holes: 54, type: '대중제', lat: 37.227, lon: 127.181 },
  { id: 'cc_16', name: '88CC', region: '경기', city: '용인시', holes: 36, type: '회원제', lat: 37.24, lon: 127.105 },
  { id: 'cc_17', name: '골드CC', region: '경기', city: '용인시', holes: 27, type: '회원제', lat: 37.19, lon: 127.21 },
  { id: 'cc_18', name: '남촌CC', region: '경기', city: '광주시', holes: 18, type: '회원제', lat: 37.386, lon: 127.242 },
  { id: 'cc_19', name: '곤지암CC', region: '경기', city: '광주시', holes: 18, type: '회원제', lat: 37.347, lon: 127.308 },
  { id: 'cc_20', name: '이포CC', region: '경기', city: '여주시', holes: 27, type: '대중제', lat: 37.27, lon: 127.58 },
  { id: 'cc_21', name: '블루헤런CC', region: '경기', city: '여주시', holes: 27, type: '회원제', lat: 37.28, lon: 127.64 },
  { id: 'cc_22', name: '해슬리나인브릿지', region: '경기', city: '여주시', holes: 18, type: '회원제', lat: 37.32, lon: 127.62 },
  { id: 'cc_23', name: '프리스틴밸리CC', region: '경기', city: '양평군', holes: 18, type: '대중제', lat: 37.49, lon: 127.49 },
  { id: 'cc_24', name: '서서울CC', region: '경기', city: '김포시', holes: 27, type: '회원제', lat: 37.63, lon: 126.68 },
  { id: 'cc_25', name: '베어즈베스트청라', region: '인천', city: '서구', holes: 27, type: '대중제', lat: 37.535, lon: 126.63 },
  { id: 'cc_26', name: '잭니클라우스GC코리아', region: '인천', city: '연수구', holes: 18, type: '회원제', lat: 37.38, lon: 126.63 },

  // ===== 강원 =====
  { id: 'cc_27', name: '강촌CC', region: '강원', city: '춘천시', holes: 18, type: '회원제', lat: 37.83, lon: 127.6 },
  { id: 'cc_28', name: '오크밸리CC', region: '강원', city: '원주시', holes: 36, type: '회원제', lat: 37.31, lon: 127.83 },
  { id: 'cc_29', name: '세이지우드홍천', region: '강원', city: '홍천군', holes: 18, type: '대중제', lat: 37.7, lon: 127.9 },
  { id: 'cc_30', name: '휘닉스파크CC', region: '강원', city: '평창군', holes: 18, type: '대중제', lat: 37.58, lon: 128.33 },
  { id: 'cc_31', name: '하이원CC', region: '강원', city: '정선군', holes: 18, type: '대중제', lat: 37.21, lon: 128.82 },

  // ===== 충청 =====
  { id: 'cc_32', name: '실크리버CC', region: '충북', city: '청주시', holes: 27, type: '대중제', lat: 36.64, lon: 127.49 },
  { id: 'cc_33', name: '그랜드CC', region: '충북', city: '충주시', holes: 27, type: '회원제', lat: 37.0, lon: 127.92 },
  { id: 'cc_34', name: '떼제베CC', region: '충북', city: '음성군', holes: 27, type: '회원제', lat: 36.94, lon: 127.69 },
  { id: 'cc_35', name: '우정힐스CC', region: '충남', city: '천안시', holes: 18, type: '회원제', lat: 36.76, lon: 127.19 },
  { id: 'cc_36', name: '천안상록CC', region: '충남', city: '천안시', holes: 18, type: '대중제', lat: 36.8, lon: 127.15 },
  { id: 'cc_37', name: '골든베이GC', region: '충남', city: '태안군', holes: 18, type: '대중제', lat: 36.7, lon: 126.3 },

  // ===== 호남 =====
  { id: 'cc_38', name: '광주CC', region: '광주', city: '광산구', holes: 18, type: '회원제', lat: 35.16, lon: 126.79 },
  { id: 'cc_39', name: '승주CC', region: '전남', city: '순천시', holes: 18, type: '회원제', lat: 35.02, lon: 127.35 },
  { id: 'cc_40', name: '파인비치GC', region: '전남', city: '해남군', holes: 18, type: '대중제', lat: 34.42, lon: 126.5 },
  { id: 'cc_41', name: '사우스링스영암', region: '전남', city: '영암군', holes: 36, type: '대중제', lat: 34.79, lon: 126.6 },
  { id: 'cc_42', name: '군산CC', region: '전북', city: '군산시', holes: 81, type: '대중제', lat: 35.98, lon: 126.75 },
  { id: 'cc_43', name: '무주덕유산CC', region: '전북', city: '무주군', holes: 18, type: '대중제', lat: 35.89, lon: 127.73 },

  // ===== 영남 =====
  { id: 'cc_44', name: '대구CC', region: '대구', city: '동구', holes: 18, type: '회원제', lat: 35.93, lon: 128.68 },
  { id: 'cc_45', name: '팔공CC', region: '대구', city: '동구', holes: 27, type: '회원제', lat: 35.98, lon: 128.7 },
  { id: 'cc_46', name: '블루원디아너스', region: '경북', city: '경주시', holes: 18, type: '회원제', lat: 35.83, lon: 129.28 },
  { id: 'cc_47', name: '부산CC', region: '부산', city: '기장군', holes: 18, type: '회원제', lat: 35.26, lon: 129.19 },
  { id: 'cc_48', name: '아시아드CC', region: '부산', city: '기장군', holes: 36, type: '대중제', lat: 35.28, lon: 129.14 },
  { id: 'cc_49', name: '통도파인이스트CC', region: '경남', city: '양산시', holes: 27, type: '회원제', lat: 35.48, lon: 129.06 },
  { id: 'cc_50', name: '창원CC', region: '경남', city: '창원시', holes: 18, type: '회원제', lat: 35.25, lon: 128.65 },

  // ===== 제주 =====
  { id: 'cc_51', name: '나인브릿지', region: '제주', city: '서귀포시', holes: 18, type: '회원제', lat: 33.3, lon: 126.35 },
  { id: 'cc_52', name: '엘리시안제주CC', region: '제주', city: '제주시', holes: 27, type: '대중제', lat: 33.42, lon: 126.44 },
  { id: 'cc_53', name: '사이프러스GC', region: '제주', city: '서귀포시', holes: 18, type: '대중제', lat: 33.29, lon: 126.42 },
  { id: 'cc_54', name: '오라CC', region: '제주', city: '제주시', holes: 27, type: '회원제', lat: 33.46, lon: 126.51 },
]

/* 시·도 필터용 목록 (데이터에 실제로 존재하는 지역만) */
export const REGIONS = [...new Set(GOLF_COURSES.map((c) => c.region))]

/* 처음 대시보드에 올라가는 지역 대표 10곳 */
export const DEFAULT_DASHBOARD_IDS = GOLF_COURSES.slice(0, 10).map((c) => c.id)

/* id로 골프장 정보 조회 (대시보드에 없어도 전체 목록에서 찾는다) */
export const findGolfCourse = (id) => GOLF_COURSES.find((c) => c.id === id)
