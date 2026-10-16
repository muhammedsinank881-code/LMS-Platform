
import { useId } from 'react'
import {
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { Button, Card, Checkbox } from '@/components/ui'
import type { ContentPreference, ContentPreferences } from '../pages/learningContent'

interface ContentPreferencesSidebarProps {
  preferences: ContentPreferences
  isExpanded: boolean
  onToggleExpanded: () => void
  onPreferenceChange: (key: ContentPreference, checked: boolean) => void
  onSelectAll: () => void
  onClear: () => void
  className?: string
}

const CONTENT_OPTIONS: { key: ContentPreference; label: string }[] = [
  { key: 'notes', label: 'Notes' },
  { key: 'videos', label: 'Videos' },
  { key: 'images', label: 'Images' },
  { key: 'diagrams', label: 'Diagrams' },
  { key: 'externalLinks', label: 'External links' },
  { key: 'liveClasses', label: 'Live classes' },
  { key: 'codeExamples', label: 'Code examples' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'quizzes', label: 'Quizzes' },
]

export function ContentPreferencesSidebar({
  preferences,
  isExpanded,
  onToggleExpanded,
  onPreferenceChange,
  onSelectAll,
  onClear,
  className,
}: ContentPreferencesSidebarProps) {
  const idPrefix = useId()

  return (
    <aside aria-label="Content preferences" className={className}>
      <Card className={isExpanded ? 'p-3' : 'p-0'}>
        <div
          className={`flex items-center ${
            isExpanded ? 'justify-between' : 'justify-center'
          }`}
        >
          {isExpanded && (
            <h2 className="text-sm font-semibold text-foreground">
              Content
            </h2>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
              isExpanded
                ? 'Collapse content preferences'
                : 'Expand content preferences'
            }
            aria-expanded={isExpanded}
            onClick={onToggleExpanded}
          >
            {isExpanded ? <PanelRightClose /> : <PanelRightOpen />}
          </Button>
        </div>

        {isExpanded && (
          <div className="mt-3">
            <p className="mb-3 text-[11px] text-muted-foreground">
              Choose what appears in the lesson. Hidden materials are not removed.
            </p>

            <div className="mb-2 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[11px]"
                onClick={onSelectAll}
              >
                Select all
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-[11px]"
                onClick={onClear}
              >
                Clear
              </Button>
            </div>

            <div className="space-y-1">
              {CONTENT_OPTIONS.map(({ key, label }) => {
                const id = `${idPrefix}-content-preference-${key}`

                return (
                  <label
                    key={key}
                    htmlFor={id}
                    className="flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-1 text-xs text-foreground hover:bg-surface-hover"
                  >
                    <Checkbox
                      id={id}
                      size="sm"
                      checked={preferences[key] === true}
                      onCheckedChange={(checked) =>
                        onPreferenceChange(key, checked === true)
                      }
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </Card>
    </aside>
  )
}
