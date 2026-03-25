import { Progress } from '@src'

export function StepMode() {
  const STEPS = ['Queued', 'Building', 'Deploying', 'Done']

  return <Progress value={2} max={STEPS} />
}
