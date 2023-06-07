import Link from 'next/link';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <main className='p-4'>
      <Link href='/'>
        <button
          type='button'
          className='mb-2 inline-block rounded-lg bg-gray-400 px-2'>
          返回
        </button>
      </Link>
      <iframe
        className='rounded-xl'
        src={`https://open.spotify.com/embed/track/${params.id}?utm_source=generator`}
        width='100%'
        height='352'
        allowFullScreen
        allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
        loading='lazy'></iframe>
    </main>
  );
}
