import { AcquisitionPage } from '@/components/acquisition-page'
export default function Page({searchParams}:{searchParams:Promise<{market?:string}>}){return <AcquisitionPage funnel='investors' searchParams={searchParams}/>}
