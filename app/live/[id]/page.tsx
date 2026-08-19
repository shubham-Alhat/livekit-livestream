"use client";

import React from "react";

function Livepage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);

  return (
    <>
      <div>hello world : {id}</div>
    </>
  );
}

export default Livepage;
