import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Plane, Building, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const groupVisaSchema = z.object({
  numberOfPassengers: z.number().min(1),
  flightItinerary: z.string().min(2),
  flightCode: z.string().min(2),
  travelDate: z.string().min(2),
  countryCode: z.string().min(1),
  groupLeaderName: z.string().min(2),
  indiaNumber: z.string().min(10),
  saudiNumber: z.string().min(9),
  hotels: z.array(
    z.object({
      city: z.enum(["MAKKAH", "MADINAH"]),
      hotelName: z.string().min(2),
      roomType: z.enum(["QUAD", "PENTAGONAL", "HEXAGONAL"]),
      roomCount: z.number().min(1),
      checkIn: z.string(),
      checkOut: z.string(),
    })
  ).min(2),
});

type GroupVisaFormValues = z.infer<typeof groupVisaSchema>;

export function GroupVisaForm() {
  const [activeTab, setActiveTab] = useState<"MAKKAH" | "MADINAH">("MAKKAH");
  
  const { register, handleSubmit, formState: { errors } } = useForm<GroupVisaFormValues>({
    resolver: zodResolver(groupVisaSchema),
    defaultValues: {
      hotels: [
        { city: "MAKKAH", hotelName: "", roomType: "QUAD", roomCount: 1, checkIn: "", checkOut: "" },
        { city: "MADINAH", hotelName: "", roomType: "QUAD", roomCount: 1, checkIn: "", checkOut: "" },
      ]
    }
  });

  const onSubmit = (data: GroupVisaFormValues) => {
    console.log(data);
    // Submit to API
  };

  const getHotelIndex = (city: "MAKKAH" | "MADINAH") => city === "MAKKAH" ? 0 : 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Flight & Basic Info */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <Plane className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Flight Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Passengers</label>
            <input type="number" {...register("numberOfPassengers", { valueAsNumber: true })} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
            {errors.numberOfPassengers && <p className="text-red-500 text-xs">{errors.numberOfPassengers.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Flight Code</label>
            <input type="text" {...register("flightCode")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Travel Date</label>
            <input type="date" {...register("travelDate")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Flight Itinerary (PNR / Details)</label>
            <textarea {...register("flightItinerary")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all resize-none" rows={1} />
          </div>
        </div>
      </div>

      {/* Hotel Information (Tabs) */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-6 border-b border-border bg-secondary/30">
          <Building className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Accommodation Details</h2>
        </div>
        
        <div className="flex border-b border-border bg-muted/50">
          <button type="button" onClick={() => setActiveTab("MAKKAH")}
                  className={cn("flex-1 py-3 text-sm font-semibold transition-all border-b-2", activeTab === "MAKKAH" ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:bg-secondary")}>
            Makkah Hotel
          </button>
          <button type="button" onClick={() => setActiveTab("MADINAH")}
                  className={cn("flex-1 py-3 text-sm font-semibold transition-all border-b-2", activeTab === "MADINAH" ? "border-primary text-primary bg-background" : "border-transparent text-muted-foreground hover:bg-secondary")}>
            Madinah Hotel
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hotel Name</label>
            <input type="text" {...register(`hotels.${getHotelIndex(activeTab)}.hotelName`)} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Room Type</label>
            <select {...register(`hotels.${getHotelIndex(activeTab)}.roomType`)} 
                    className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all">
              <option value="QUAD">Quad (4 Persons)</option>
              <option value="PENTAGONAL">Pentagonal (5 Persons)</option>
              <option value="HEXAGONAL">Hexagonal (6 Persons)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check In Date</label>
            <input type="date" {...register(`hotels.${getHotelIndex(activeTab)}.checkIn`)} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Check Out Date</label>
            <input type="date" {...register(`hotels.${getHotelIndex(activeTab)}.checkOut`)} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Group Leader Info */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Group Leader Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Leader Name</label>
            <input type="text" {...register("groupLeaderName")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">India Number</label>
            <input type="tel" {...register("indiaNumber")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Saudi Number</label>
            <input type="tel" {...register("saudiNumber")} 
                   className="w-full p-2.5 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition-opacity">
          Submit Group Visa
        </button>
      </div>

    </form>
  );
}
