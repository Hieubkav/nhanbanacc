"use client";

import { api } from "@nhanbanacc/backend/convex/_generated/api";
import type { Id } from "@nhanbanacc/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";

export default function StudentsPage() {
  const students = useQuery(api.student.getAll);
  const createStudent = useMutation(api.student.createStudent);
  const deleteStudent = useMutation(api.student.deleteStudent);

  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [className, setClassName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAge = Number(age);
    if (!name.trim() || !className.trim() || Number.isNaN(parsedAge)) return;
    await createStudent({ name: name.trim(), age: parsedAge, class: className.trim() });
    setName("");
    setAge("");
    setClassName("");
  };

  const handleDelete = (id: Id<"students">) => {
    deleteStudent({ id });
  };

  if (students === undefined) {
    return (
      <div className="mx-auto w-full max-w-xl py-10">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Đang tải danh sách học sinh...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <CardDescription>Thêm, xem và xóa học sinh</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="sm:col-span-2"
            />
            <Input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              type="number"
              min={0}
            />
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class"
            />
            <div className="sm:col-span-4">
              <Button type="submit" disabled={!name.trim() || !className.trim() || !age}>
                Add Student
              </Button>
            </div>
          </form>

          {Array.isArray(students) && students.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Chưa có học sinh nào.</p>
          ) : (
            <ul className="space-y-2">
              {Array.isArray(students) && students.map((student) => (
                <li
                  key={student._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tuổi: {student.age} • Lớp: {student.class}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(student._id as Id<"students">)}
                    aria-label="Delete student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
