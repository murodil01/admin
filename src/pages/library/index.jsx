import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Library = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] text-center px-4 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Feature Coming Soon M Library
      </h1>

      <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl">
        This section is currently under development. We appreciate your patience
        while we work to bring this feature to life.
      </p>

      <DotLottieReact
        src="https://lottie.host/490acce8-7833-4e33-b3f2-9903dc15fb15/rVridJRK6u.lottie"
        loop
        autoplay
        className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
      />
    </div>
  );
};

export default Library;
