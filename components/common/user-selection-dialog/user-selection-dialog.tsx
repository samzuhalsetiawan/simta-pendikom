"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { User } from "@/types/user/user"
import { Check, ChevronsUpDown } from "lucide-react"
import React, { useState } from "react"

type UserSelectionDialogProps = {
   users?: User[]
   trigger?: React.ReactNode,
   initialUser?: User,
   onUserSelected?: (user: User) => void,
   className?: string
}

export function UserSelectionDialog({
   users = [],
   trigger,
   initialUser,
   onUserSelected,
   className
}: UserSelectionDialogProps) {

   const [openMainDialog, setOpenMainDialog] = useState(false)
   const [selectedUser, setSelectedUser] = useState(initialUser)

   return (
      <Popover open={openMainDialog} onOpenChange={setOpenMainDialog}>
         <PopoverTrigger asChild className={cn(className)}>
            {trigger ? trigger : 
               <Card className="py-4">
                  <CardContent className="w-full h-fit flex items-center">
                     {selectedUser
                        ? <div className="flex-1 flex gap-2 items-center">
                           <Avatar className="h-10 w-10">
                              <AvatarImage src={selectedUser.image} alt={selectedUser.name} />
                              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <span>[{'nip' in selectedUser ? selectedUser.nip : selectedUser.nim}]</span>
                           <span>{selectedUser.name}</span>
                        </div>
                        : <span className="flex-1 text-start">Nothing selected...</span>}
                     <ChevronsUpDown className="opacity-50" />
                  </CardContent>
               </Card>}
         </PopoverTrigger>
         <PopoverContent className="w-fit p-1">
            <Command>
               <CommandInput placeholder="Search..." className="h-9" />
               <CommandList>
                  <CommandEmpty>Nothing found.</CommandEmpty>
                  <CommandGroup>
                     {users.map((user) => (
                        <CommandItem
                           key={user.id}
                           value={`${user.name}_${'nip' in user ? user.nip : user.nim}`}
                           onSelect={(_) => {
                              onUserSelected && onUserSelected(user)
                              setSelectedUser(user)
                              setOpenMainDialog(false)
                           }}
                        >
                           <div className="flex-1 flex gap-2 items-center">
                              <Avatar className="h-10 w-10">
                                 <AvatarImage src={user.image} alt={user.name} />
                                 <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-mono">[{'nip' in user ? user.nip : user.nim}]</span>
                              <span>{user.name}</span>
                           </div>
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   )
}