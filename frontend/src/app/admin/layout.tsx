import { SocketProvider } from "@/lib/socket-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  )
}
