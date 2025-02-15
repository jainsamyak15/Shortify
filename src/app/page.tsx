'use client';

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card";
import { Spotlight } from "@/components/ui/spotlight";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";

export default function SplineSceneBasic() {
  const { login, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    if (authenticated) {
      console.log("User is authenticated:", user);
      // Redirect or perform other actions after successful login
    }
  }, [authenticated, user]);

  return (
    <Card className="w-full h-[100vh] bg-black/[0.96] relative overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" />

      <div className="flex h-full">
        {/* Left content */}
        <div className="flex p-8 relative z-10 flex-col justify-center items-center ml-5">
          <h1 className="text-4xl md:text-[4rem] p-8 font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Shortify
          </h1>
          <p className="mt-4 text-neutral-500 max-w-lg items-center text-center">
            Stay informed with bite-sized, blockchain-powered news on the go. Unfiltered, unstoppable, and always up to date.
          </p>

          {authenticated ? (
            <RainbowButton className="mt-4" onClick={logout}>
              Disconnect Wallet
            </RainbowButton>
          ) : (
            <RainbowButton className="mt-4" onClick={login}>
              Connect Wallet
            </RainbowButton>
          )}
        </div>

        {/* Right content */}
        {/* uncomment this after finishing, this is causing issue in loading */}
        {/* <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div> */}
      </div>
    </Card>
  );
}