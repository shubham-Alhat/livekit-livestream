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
  const [role, setRole] = useState("buyer");

  const router = useRouter();

  const handleSubmit = () => {
    if (username.trim() === "" || role.trim() === "") {
      alert("Empty fields not allowed!");
      return;
    }

    // create a unique string for userId
    const userId = crypto.randomUUID();

    router.push(`/live/${username}?userId=${userId}&role=${role}`);
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
      <Field>
        <FieldLabel htmlFor="fieldgroup-name">Seller | Buyer</FieldLabel>
        <Input
          id="fieldgroup-name"
          value={role}
          onChange={(e) => setRole(e.target.value)}
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
