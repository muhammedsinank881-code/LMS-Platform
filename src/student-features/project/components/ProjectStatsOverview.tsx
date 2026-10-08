import { Award, CheckCircle2, Clock, FolderKanban } from 'lucide-react'
import { Card } from '@/components/ui'

interface ProjectStats {
    totalMilestones: number
    completedMilestones: number
    inProgressMilestones: number
    progressPercentage: number
}

interface ProjectStatsOverviewProps {
    stats: ProjectStats
}

export function ProjectStatsOverview({ stats }: ProjectStatsOverviewProps) {
    const statItems = [
        {
            label: 'Total Milestones',
            value: stats.totalMilestones,
            icon: FolderKanban,
            iconColor: 'text-primary',
            bgColor: 'bg-primary/10',
            valueColor: 'text-foreground',
        },
        {
            label: 'Completed',
            value: stats.completedMilestones,
            icon: CheckCircle2,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            valueColor: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'In Progress',
            value: stats.inProgressMilestones,
            icon: Clock,
            iconColor: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-500/10',
            valueColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Overall Score',
            value: `${stats.progressPercentage}%`,
            icon: Award,
            iconColor: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-500/10',
            valueColor: 'text-foreground',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statItems.map((item) => {
                const Icon = item.icon

                return (
                    <Card
                        key={item.label}
                        className="p-4 transition-all hover:border-primary/40 hover:shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                                {item.label}
                            </span>

                            <div className={`rounded-lg p-2 ${item.bgColor}`}>
                                <Icon className={`h-4 w-4 ${item.iconColor}`} />
                            </div>
                        </div>

                        <div className="mt-2">
                            <span
                                className={`text-xl font-bold tracking-tight ${item.valueColor}`}
                            >
                                {item.value}
                            </span>
                        </div>
                    </Card>
                )
            })}
        </div>
    )
}