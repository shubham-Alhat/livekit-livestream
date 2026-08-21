import Link from "next/link";
import { Card } from "./ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export const LivestreamCard = () => {
  return (
    <>
      <Link href={`/home/live/`}>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-card border-border">
          {/* Image Container */}
          <div className="relative overflow-hidden bg-muted h-48">
            <Image
              src={
                "https://res.cloudinary.com/diery17cm/image/upload/v1779881922/apfvnjmurhd7hsogeusm.jpg"
              }
              alt="Image-Product"
              fill
              style={{ objectFit: "cover" }}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            {/* Live Badge */}
            <div className="absolute top-3 right-3">
              <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                Live · {29}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Seller Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage alt="user-image" />
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  SA
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">shubham</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground line-clamp-2">
              shubham live streaming..
            </h3>

            {/* Bid Info */}
          </div>
        </Card>
      </Link>
    </>
  );
};
