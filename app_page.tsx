import Image from 'next/image';

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <Image src="/flying-horse.png" alt="Flying Horse" width={180} height={120} />
          <h1>KFQUARE</h1>
          <p>
            Data analytics powered by Large Language Models (LLM). We train models and deliver predictive analysis for transformative business insights.
          </p>
        </div>
      </section>
    </main>
  );
}