import SunCalc from 'suncalc';

export interface SolarPosition {
  /** 태양 방위각 (도, 북=0, 시계 방향) */
  azimuthDeg: number;
  /** 태양 고도 (도) */
  altitudeDeg: number;
}

/** 시간대별 태양 위치 계산 (기본 30분 간격) */
export function getDailySolarPositions(
  lat: number,
  lng: number,
  date: Date,
  intervalMinutes = 30
): Array<{ time: Date; position: SolarPosition }> {
  const times = SunCalc.getTimes(date, lat, lng);
  const sunrise = times.sunrise;
  const sunset = times.sunset;

  const results: Array<{ time: Date; position: SolarPosition }> = [];
  const current = new Date(sunrise);

  while (current <= sunset) {
    const pos = SunCalc.getPosition(current, lat, lng);
    // suncalc azimuth: 남=0, 서=양수 (라디안) → 변환: 북=0 도
    const azimuthDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360;
    const altitudeDeg = (pos.altitude * 180) / Math.PI;

    if (altitudeDeg > 0) {
      results.push({
        time: new Date(current),
        position: { azimuthDeg, altitudeDeg },
      });
    }

    current.setMinutes(current.getMinutes() + intervalMinutes);
  }

  return results;
}

/** 일출/일몰 시각 */
export function getSunTimes(
  lat: number,
  lng: number,
  date: Date
): { sunrise: Date; sunset: Date; solarNoon: Date } {
  const times = SunCalc.getTimes(date, lat, lng);
  return {
    sunrise: times.sunrise,
    sunset: times.sunset,
    solarNoon: times.solarNoon,
  };
}
