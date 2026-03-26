import Hero from "@/components/home/hero";
import Partners from "@/components/home/Partners";
import Categories from "@/components/home/Categories";
import WhyChoose from "@/components/home/WhyChoose";
import SignatureDishes from "@/components/home/SignatureDishes";
import Platters from "@/components/home/Platters";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Partners />
      <Categories />
      <WhyChoose />
      <SignatureDishes />
      <Platters />
      <Testimonials />
      <CTA />
    </>
  );
}