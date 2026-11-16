import BrandBand from './BrandBand'

export default function BrandHeader() {
  return (
    <BrandBand className="h-[76px]">
      {/* Ganti dengan <img src="/logo-dexa.svg"> kalau sudah punya file logo resmi */}
      <span className="text-[34px] font-extrabold italic leading-none tracking-tight text-white">dexa group</span>
    </BrandBand>
  )
}