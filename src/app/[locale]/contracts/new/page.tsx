"use client";

import React from "react";
import { Input } from "../../../../components/ui/input";
import { TextArea } from "../../../../components/ui/textArea";
import { useFormik } from "formik";
import { CreateContract } from "../../../../models/contract";
import { useObligations } from "../../../../lib/hooks/useObligations";
import ObligationComponent from "../../../../components/obligationComponent";
interface CreateContractPageProps {}

const CreateContractPage: React.FC<CreateContractPageProps> = () => {
  const { obligations } = useObligations();
  const formik = useFormik<CreateContract>({
    initialValues: {
      title: "",
      dueDate: new Date(),
      description: null,
    },
    onSubmit: values => {
      console.log(values);
    },
  });

  return (
    <div className="w-full h-full flex flex-col justify-center items-start p-3 border rounded-md border-muted-foreground">
      <div className="w-full h-full flex flex-col gap-5">
        <Input
          label="Title"
          maxLength={36}
          type="text"
          name="title"
          value={formik.values.title}
          onChange={formik.handleChange}
          placeholder="Reading books everyday"
        />
        <TextArea
          label="Description"
          className="h-20"
          name="description"
          value={formik.values.description ?? ""}
          onChange={formik.handleChange}
          placeholder="Orel and Sara will read books everyday for 30 minutes."
          rows={1}
        />
      </div>
      <div className="flex flex-wrap gap-3 justify-start items-start overflow-auto">
        {obligations.map(obligation => (
          <ObligationComponent
            obligation={obligation}
            key={obligation.obligationId}
          />
        ))}
      </div>
      <div className="h-1 w-full border-b border-b-muted mb-4"></div>
      <Input
        className="w-full"
        label="Due Date"
        type="date"
        name="dueDate"
        value={formik.values.dueDate.toISOString().split("T")[0]}
        onChange={e => {
          console.log(e.target.value);
          formik.setFieldValue("dueDate", new Date(e.target.value));
        }}
      />
    </div>
  );
};

export default CreateContractPage;
