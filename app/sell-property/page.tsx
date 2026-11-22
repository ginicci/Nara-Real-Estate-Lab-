import { AcquisitionPage } from '@/components/acquisition-page'
export default function Page({searchParams}:{searchParams:Promise<{market?:string}>}){return <AcquisitionPage funnel='sell-property' searchParams={searchParams}/>}
