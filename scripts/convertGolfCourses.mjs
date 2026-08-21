/**
 * 공공데이터 CSV → src/data/golfCourses.js 변환 스크립트
 *
 * 앱에 내장된 골프장 목록은 주요 골프장을 추린 것이고 좌표도 시·군·구 단위 근사치다.
 * 공식 데이터로 교체하고 싶을 때 이 스크립트를 쓴다.
 *
 * 1) 아래에서 CSV를 내려받는다 (회원가입 필요)
 *    - 문화체육관광부 전국 골프장 현황
 *      https://www.data.go.kr/data/15118920/fileData.do
 *    - 행정안전부 생활_골프장 (인허가 정보, 좌표 포함)
 *      https://www.data.go.kr/data/15045080/fileData.do
 *
 * 2) 파일을 data/golf-raw.csv 로 저장한 뒤 실행
 *    node scripts/convertGolfCourses.mjs data/golf-raw.csv > src/data/golfCourses.generated.js
 *
 * 3) 결과를 확인하고 golfCourses.js 를 대체한다.
 *
 * ⚠️ 원본 CSV는 보통 EUC-KR 인코딩이고 컬럼명이 데이터셋마다 다르다.
 *    아래 COLUMN_ALIASES 를 실제 헤더에 맞게 손봐서 쓸 것.
 *    행안부 데이터의 좌표(X/Y)는 GRS80 중부원점(EPSG:5174)이라 위경도 변환이 별도로 필요하다.
 */
import { readFileSync } from 'node:fs'

const COLUMN_ALIASES = {
  name: ['사업장명', '업소명', '골프장명', '시설명'],
  address: ['소재지전체주소', '도로명전체주소', '소재지', '주소'],
  holes: ['홀수', '홀', '규모'],
  type: ['구분', '운영형태', '골프장구분'],
  lat: ['위도', 'lat', 'Y좌표'],
  lon: ['경도', 'lon', 'X좌표'],
}

/* 시·도 이름을 앱에서 쓰는 짧은 형태로 */
const REGION_MAP = [
  ['서울', '서울'],
  ['부산', '부산'],
  ['대구', '대구'],
  ['인천', '인천'],
  ['광주', '광주'],
  ['대전', '대전'],
  ['울산', '울산'],
  ['세종', '세종'],
  ['경기', '경기'],
  ['강원', '강원'],
  ['충청북도', '충북'],
  ['충북', '충북'],
  ['충청남도', '충남'],
  ['충남', '충남'],
  ['전라북도', '전북'],
  ['전북', '전북'],
  ['전라남도', '전남'],
  ['전남', '전남'],
  ['경상북도', '경북'],
  ['경북', '경북'],
  ['경상남도', '경남'],
  ['경남', '경남'],
  ['제주', '제주'],
]

/* 따옴표를 고려한 최소한의 CSV 파서 */
const parseCsv = (text) => {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''))
      rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

const pickIndex = (header, aliases) =>
  header.findIndex((column) => aliases.some((alias) => column.trim().includes(alias)))

const toRegion = (address = '') => {
  const found = REGION_MAP.find(([keyword]) => address.startsWith(keyword))
  return found ? found[1] : '기타'
}

const toCity = (address = '') => address.split(/\s+/)[1] ?? ''

const main = () => {
  const file = process.argv[2]
  if (!file) {
    console.error('사용법: node scripts/convertGolfCourses.mjs <csv 경로>')
    process.exit(1)
  }

  const rows = parseCsv(readFileSync(file, 'utf-8'))
  const [header, ...body] = rows

  const index = Object.fromEntries(
    Object.entries(COLUMN_ALIASES).map(([key, aliases]) => [key, pickIndex(header, aliases)]),
  )

  if (index.name < 0) {
    console.error('골프장 이름 컬럼을 찾지 못했습니다. COLUMN_ALIASES를 확인하세요.')
    console.error('헤더:', header.join(' | '))
    process.exit(1)
  }

  const courses = body
    .filter((row) => row[index.name]?.trim())
    .map((row, i) => {
      const address = index.address >= 0 ? row[index.address] : ''
      return {
        id: `cc_${String(i + 1).padStart(3, '0')}`,
        name: row[index.name].trim(),
        region: toRegion(address),
        city: toCity(address),
        holes: Number(String(row[index.holes] ?? '').replace(/\D/g, '')) || 18,
        type: (row[index.type] ?? '').includes('회원') ? '회원제' : '대중제',
        lat: Number(row[index.lat]) || null,
        lon: Number(row[index.lon]) || null,
      }
    })
    /* 좌표가 없으면 날씨를 조회할 수 없으므로 제외한다 */
    .filter((course) => course.lat && course.lon)

  console.log('/* 공공데이터 CSV에서 자동 생성된 파일입니다. */')
  console.log(`export const GOLF_COURSES = ${JSON.stringify(courses, null, 2)}`)
  console.error(`변환 완료: ${courses.length}곳 (좌표 없는 행은 제외)`)
}

main()
