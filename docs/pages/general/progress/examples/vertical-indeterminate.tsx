import { Progress } from '@src'

export function VerticalIndeterminate() {
  return (
    <div class="flex gap-10">
      <div class="h-44">
        <Progress value={15} orientation="vertical" status animation="swing" />
      </div>
      <div class="h-44">
        <Progress value={null} orientation="vertical" animation="elastic" />
      </div>
    </div>
  )
}
