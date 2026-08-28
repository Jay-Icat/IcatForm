import { Question } from "@/types/quiz";

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "q1",
    order: 1,
    questionText: "Which creative dimension excites your passion the most?",
    type: "single",
    category: "Specialization",
    options: [
      { id: "q1_opt1", text: "Game Development & 3D Interactive Worlds" },
      { id: "q1_opt2", text: "VFX, Cinema & 3D Character Animation" },
      { id: "q1_opt3", text: "UI/UX & Futuristic Digital Experiences" },
      { id: "q1_opt4", text: "Graphic Design, Advertising & Media" },
    ],
  },
  {
    id: "q2",
    order: 2,
    questionText: "What tools or creative software are you excited to master?",
    type: "multiple",
    category: "Software & Tools",
    options: [
      { id: "q2_opt1", text: "Unreal Engine 5 & Unity 3D" },
      { id: "q2_opt2", text: "Maya, Blender & Houdini VFX" },
      { id: "q2_opt3", text: "Figma, Adobe XD & WebGL Prototyping" },
      { id: "q2_opt4", text: "Photoshop, Illustrator & After Effects" },
    ],
  },
  {
    id: "q3",
    order: 3,
    questionText: "What style of creative projects do you dream of building?",
    type: "single",
    category: "Portfolio Vision",
    options: [
      { id: "q3_opt1", text: "AAA Console & PC Action Games" },
      { id: "q3_opt2", text: "Hollywood-Grade CGI & Cinematic Scenes" },
      { id: "q3_opt3", text: "Next-Gen AI & Interactive Web Apps" },
      { id: "q3_opt4", text: "Global Brand Identities & Viral Media" },
    ],
  },
  {
    id: "q4",
    order: 4,
    questionText: "Which ICAT Campus is closest to your location?",
    type: "single",
    category: "Campus Preference",
    options: [
      { id: "q4_opt1", text: "Chennai Campus" },
      { id: "q4_opt2", text: "Bangalore Campus" },
      { id: "q4_opt3", text: "Hyderabad Campus" },
      { id: "q4_opt4", text: "Open to Any / Online Inquiries" },
    ],
  },
  {
    id: "q5",
    order: 5,
    questionText: "When are you planning to begin your creative career journey?",
    type: "single",
    category: "Admissions Timeline",
    options: [
      { id: "q5_opt1", text: "Immediate Upcoming Intake" },
      { id: "q5_opt2", text: "Next Academic Year" },
      { id: "q5_opt3", text: "Looking for Fast-Track Diploma / PG" },
      { id: "q5_opt4", text: "Exploring Options & Counseling" },
    ],
  },
];
