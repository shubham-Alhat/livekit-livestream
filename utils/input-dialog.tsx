"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InputFieldgroup() {
  const [username, setUsername] = useState("");

  const router = useRouter();

  const handleSubmit = () => {
    if (username.trim() === "") {
      alert("Please enter a unique name!");
      return;
    }

    router.push(`/live/${username}`);
  };

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Unique username</FieldLabel>
        <Input
          id="fieldgroup-name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Jordan Lee"
        />
      </Field>

      <Field orientation="horizontal">
        <Button onClick={handleSubmit} className="cursor-pointer">
          Go Live
        </Button>
      </Field>
    </FieldGroup>
  );
}
