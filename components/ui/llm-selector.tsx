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
    <SelectItem value="light">GPT 3.5</SelectItem>
    <SelectItem value="dark">GPT 4</SelectItem>
    <SelectItem value="system">GPT 4 Trubo</SelectItem>
    <SelectItem value="system">GPT 4o</SelectItem>
  </SelectContent>
</Select>)}
