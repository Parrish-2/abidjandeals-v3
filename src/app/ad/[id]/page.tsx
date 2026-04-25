import AdDetailClient from './AdDetailClient'

interface Props {
    params: { id: string }
}

export default function AdDetailPage({ params }: Props) {
    return <AdDetailClient id={params.id} />
}
