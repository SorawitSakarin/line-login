"use client";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@heroui/react";
import liff from "@line/liff";

import { title } from "@/components/primitives";
export interface UserProfile {
  displayName: string | undefined;
  userId: string | undefined;
  pictureUrl?: string;
  statusMessage?: string;
}

export default function Line() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    displayName: "",
    userId: "",
    pictureUrl: "",
    statusMessage: "",
  });
  const [liffInformation, setLiffInformation] = useState({
    appLanguage: "",
    version: "",
    isInClient: false,
    isLoggedIn: false,
    os: "",
    lineVersion: "",
  });
  const liffId = "2007670208-46qZnxGB";

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        await liff.init({ liffId });
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          const appLanguage = liff.getAppLanguage();
          const version = liff.getVersion();
          const isInClient = liff.isInClient();
          const isLoggedIn = liff.isLoggedIn();
          const os = liff?.getOS() || "";
          const lineVersion = liff?.getLineVersion() || "";

          setUserProfile(profile);
          setLiffInformation({
            appLanguage,
            version,
            isInClient,
            isLoggedIn,
            os,
            lineVersion,
          });

          await liff.sendMessages([
            {
              type: "text",
              text: "Hello from LIFF!",
            },
          ]);
        } else {
          liff.login();
          const profile = await liff.getProfile();
          const appLanguage = liff.getAppLanguage();
          const version = liff.getVersion();
          const isInClient = liff.isInClient();
          const isLoggedIn = liff.isLoggedIn();
          const os = liff?.getOS() || "";
          const lineVersion = liff?.getLineVersion() || "";

          setUserProfile(profile);
          setLiffInformation({
            appLanguage,
            version,
            isInClient,
            isLoggedIn,
            os,
            lineVersion,
          });
        }

        await liff.sendMessages([
          {
            type: "text",
            text: "Hello from LIFF!",
          },
        ]);
      } catch (error) {
        console.log("Error initializing LIFF:", error);
      }
    };

    initializeLiff();
  }, []);

  const sendMessageToLine = async () => {
    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello from LIFF!",
          userId: userProfile.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data.error || "Failed to send message");
      }
    } catch (error) {
      console.log("Network error. Please try again.");
    }
  };

  return (
    <section className="flex flex-col items-start justify-start gap-8">
      <div className="inline-block max-w-xl text-left justify-center md:whitespace-nowrap">
        <span className={title()}>Notification&nbsp;</span>
        <span className={title({ color: "blue" })}>Line</span>
      </div>
      <Card className="max-w-[340px]">
        <CardHeader className="justify-between">
          <div className="flex gap-5">
            <Avatar
              isBordered
              radius="full"
              size="md"
              src={userProfile.pictureUrl}
            />
            <div className="flex flex-col gap-1 items-start justify-center">
              <h4 className="text-small font-semibold leading-none text-default-600">
                {userProfile.displayName}
              </h4>
              <h5 className="text-small tracking-tight text-default-400">
                {userProfile.statusMessage}
              </h5>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-3 py-0 text-small text-default-400">
          <p>ID: {userProfile.userId}</p>
          <p>Language: {liffInformation.appLanguage}</p>
          <p>Version: {liffInformation.version}</p>
          <p>Is In Client: {liffInformation.isInClient.toString()}</p>
          <p>Is Logged In: {liffInformation.isLoggedIn.toString()}</p>
          <p>OS: {liffInformation.os}</p>
          <p>Line Version: {liffInformation.lineVersion}</p>
        </CardBody>
        <CardFooter className="gap-3">
          <Button
            color="primary"
            variant="solid"
            onPress={() => sendMessageToLine()}
          >
            Send Message
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
