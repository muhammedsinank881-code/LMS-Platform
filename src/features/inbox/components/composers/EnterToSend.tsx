import { Checkbox } from '@/components/ui'
import { useComposerSettings } from '../../lib/composer-settings'

export function EnterToSend() {
  const enterToSend = useComposerSettings((state) => state.enterToSend)
  const setEnterToSend = useComposerSettings((state) => state.setEnterToSend)
  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Checkbox
        size="sm"
        checked={enterToSend}
        onCheckedChange={(checked) => setEnterToSend(checked === true)}
      />
      <span>Enter to send<span className="max-sm:hidden"> · Shift+Enter for a new line</span></span>
    </label>
  )
}
