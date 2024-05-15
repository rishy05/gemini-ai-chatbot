import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

  
export function LlmSelect(){
    return(
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Model" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="GPT 3.5">GPT 3.5</SelectItem>
    <SelectItem value="GPT 4">GPT 4</SelectItem>
    <SelectItem value="GPT 4 Turbo">GPT 4 Turbo</SelectItem>
    <SelectItem value="GPT 4o">GPT 4o</SelectItem>
  </SelectContent>
</Select>)}
