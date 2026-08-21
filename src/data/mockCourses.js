import { ref } from 'vue'

/* ===== Mock Data =====
 * 실제 기상 API 대신 사용하는 임시 데이터.
 * 여러 View(Home / Detail / Alert)가 같은 배열을 참조하도록
 * 모듈 스코프의 ref로 만들어 공유한다.
 *
 * windDeg   : 바람이 "불어오는" 방향(기상 표준). 0=북, 90=동, 180=남, 270=서
 * windSpeed : 풍속(m/s)
 * humidity  : 습도(%)
 * lightning : 낙뢰 확률(%)
 */
export const courseList = ref([
  {
    id: 'cc_01',
    name: '서울',
    region: '대한민국 서울특별시',
    course: '남서울CC',
    temp: 28,
    status: '맑음',
    windSpeed: 6,
    windDeg: 0,
    humidity: 55,
    lightning: 0,
  },
  {
    id: 'cc_02',
    name: '춘천',
    region: '강원특별자치도 춘천시',
    course: '라데나GC',
    temp: 24,
    status: '비',
    windSpeed: 9,
    windDeg: 45,
    humidity: 88,
    lightning: 35,
  },
  {
    id: 'cc_03',
    name: '부산',
    region: '부산광역시 기장군',
    course: '해운대CC',
    temp: 26,
    status: '구름',
    windSpeed: 12,
    windDeg: 180,
    humidity: 72,
    lightning: 5,
  },
  {
    id: 'cc_04',
    name: '경주',
    region: '경상북도 경주시',
    course: '경주신라CC',
    temp: 31,
    status: '맑음',
    windSpeed: 3,
    windDeg: 270,
    humidity: 40,
    lightning: 0,
  },
  {
    id: 'cc_05',
    name: '제주',
    region: '제주특별자치도 서귀포시',
    course: '핀크스GC',
    temp: 20,
    status: '흐림',
    windSpeed: 14,
    windDeg: 90,
    humidity: 80,
    lightning: 15,
  },
  {
    id: 'cc_06',
    name: '대관령',
    region: '강원특별자치도 평창군',
    course: '알펜시아GC',
    temp: 10,
    status: '눈',
    windSpeed: 7,
    windDeg: 315,
    humidity: 65,
    lightning: 0,
  },
  {
    id: 'cc_07',
    name: '광주',
    region: '광주광역시 북구',
    course: '무등산CC',
    temp: 30,
    status: '흐림',
    windSpeed: 5,
    windDeg: 135,
    humidity: 85,
    lightning: 55,
  },
  {
    id: 'cc_08',
    name: '대전',
    region: '대전광역시 유성구',
    course: '유성CC',
    temp: 27,
    status: '맑음',
    windSpeed: 2,
    windDeg: 225,
    humidity: 50,
    lightning: 0,
  },
  {
    id: 'cc_09',
    name: '인천',
    region: '인천광역시 중구',
    course: '스카이72',
    temp: 25,
    status: '비',
    windSpeed: 11,
    windDeg: 20,
    humidity: 90,
    lightning: 70,
  },
  {
    id: 'cc_10',
    name: '울산',
    region: '울산광역시 울주군',
    course: '울산CC',
    temp: 32,
    status: '맑음',
    windSpeed: 4,
    windDeg: 160,
    humidity: 78,
    lightning: 10,
  },
])

/* 동적 경로의 cityId로 도시 객체를 찾는다. 없으면 undefined */
export const findCourseById = (cityId) => courseList.value.find((c) => c.id === cityId)

/* ===== 기상 갱신(시뮬레이션) ===== */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

export const refreshWeather = () => {
  courseList.value = courseList.value.map((c) => ({
    ...c,
    windSpeed: rand(0, 15),
    windDeg: rand(0, 7) * 45,
    humidity: rand(35, 95),
    lightning: rand(0, 100) < 30 ? rand(50, 90) : rand(0, 30),
  }))
}
