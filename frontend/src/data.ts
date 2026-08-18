// The data that we would normally receive from the API
import { Equipment, UserData, Member } from "./types.ts";

export const equipment: Equipment[] = [
  {
    id: 1,
    unique_name: "Prusa MK4S",
    type: "3D Printer",
  },
  {
    id: 2,
    unique_name: "Prusa CORE One L",
    type: "3D Printer",
  },
  {
    id: 3,
    unique_name: 'Ender 3 "Mercury"',
    type: "3D Printer",
  },
  {
    id: 4,
    unique_name: 'Ender 3 "Venus"',
    type: "3D Printer",
  },
  {
    id: 5,
    unique_name: 'Ender 3 "Mars"',
    type: "3D Printer",
  },
  {
    id: 6,
    unique_name: "Prusa XL",
    type: "3D Printer",
  },
  {
    id: 7,
    unique_name: "Haas VF-2",
    type: "CNC Machine",
  },
];

export const user_data: UserData = {
  reservations: [],
  checkouts: [
    {
      id: 15,
      equipment: "Hakko soldering station",
      status: "Checked out",
      start_time: "05.08.26",
      end_time: "14.08.26",
    },
    {
      id: 16,
      equipment: "DeWault heat gun",
      status: "Overdue",
      start_time: "05.08.26",
      end_time: "06.08.26",
    },
  ],
};

export const member: Member = {
  id: 5,
  first_name: "Gus",
  last_name: "Eiffel",
  email: "gus.eiffel@students.purdue.edu",
  phone_number: "081 734 2138",
};
