import { differenceInMinutes, differenceInSeconds, type DateArg } from 'date-fns'

export function formatDurationMMSS(startDate: DateArg<Date>, endDate: DateArg<Date>) {
  const mm = `${differenceInMinutes(endDate, startDate)}`.padStart(2, '0')
  // get the remaining seconds after removing the minutes
  const ss = `${differenceInSeconds(endDate, startDate) % 60}`.padStart(2, '0')
  return `${mm}:${ss}`
}

export function formatDurationFull(startDate: DateArg<Date>, endDate: DateArg<Date>) {
  const mm = `${differenceInMinutes(endDate, startDate)}`.padStart(1, '0')
  // get the remaining seconds after removing the minutes
  const ss = `${differenceInSeconds(endDate, startDate) % 60}`.padStart(1, '0')
  if (mm == '0') return `${ss} seconds`
  return `${mm} min ${ss} s`
}
