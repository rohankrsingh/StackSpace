"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Chip,
  ScrollShadow,
} from "@heroui/react";
import { STACKS, StackTemplate } from "@/templates/stacks";
import { Search, Check, FileCode2, Terminal, ChevronRight, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (stackId: string, roomName: string) => Promise<void>;
  loading?: boolean;
}

export function CreateRoomDialog({
  open,
  onOpenChange,
  onCreateRoom,
  loading = false,
}: CreateRoomDialogProps) {
  const [selectedStack, setSelectedStack] = useState<StackTemplate | null>(null);
  const [roomName, setRoomName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const filteredStacks = STACKS.filter(
    (stack) =>
      stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleCreateRoom = async () => {
    if (!selectedStack || !roomName.trim()) {
      return;
    }

    try {
      setIsCreating(true);
      await onCreateRoom(selectedStack.id, roomName);
      setRoomName("");
      setSelectedStack(null);
      setSearchTerm("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        body: "p-0 gap-0",
        base: "bg-background border border-white/10 shadow-2xl max-h-[85vh]",
        header: "border-b border-white/10 px-6 py-4",
        footer: "border-t border-white/10 px-6 py-4",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-xl font-bold">Create a New Room</span>
              <span className="text-sm font-normal text-muted-foreground">
                Select a project template to jumpstart your collaboration session.
              </span>
            </ModalHeader>
            <ModalBody className="flex flex-row overflow-hidden">
              {/* Left Panel: Stack Selection */}
              <div className="flex-1 flex flex-col border-r border-white/10 min-w-[380px]">
                <div className="p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    startContent={<Search className="text-muted-foreground" size={18} />}
                    isClearable
                    variant="bordered"
                    radius="lg"
                    classNames={{
                      inputWrapper: "bg-default-100/50 hover:bg-default-200/50 dark:bg-default-50/50 border-white/10 group-data-[focus=true]:border-primary",
                    }}
                  />
                </div>

                <ScrollShadow className="flex-1 p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {filteredStacks.length > 0 ? (
                      filteredStacks.map((stack) => {
                        const isSelected = selectedStack?.id === stack.id;
                        return (
                          <Card
                            key={stack.id}
                            isPressable
                            onPress={() => setSelectedStack(stack)}
                            className={cn(
                              "border-2 bg-transparent transition-all duration-200",
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-transparent bg-default-50 hover:bg-default-100"
                            )}
                            shadow="none"
                          >
                            <CardBody className="p-3">
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-300",
                                  isSelected ? "bg-background shadow-sm scale-110" : "bg-default-100"
                                )}>
                                  {stack.icon}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-foreground text-base">
                                      {stack.name}
                                    </h3>
                                    {isSelected && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="bg-primary text-primary-foreground rounded-full p-1"
                                      >
                                        <Check size={12} />
                                      </motion.div>
                                    )}
                                  </div>
                                  <p className="text-small text-muted-foreground line-clamp-2">
                                    {stack.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                                    {stack.tags.slice(0, 3).map((tag) => (
                                      <Chip
                                        key={tag}
                                        size="sm"
                                        variant={isSelected ? "flat" : "bordered"}
                                        color={isSelected ? "primary" : "default"}
                                        classNames={{
                                          base: "h-5 text-[10px] border-white/20",
                                          content: "px-1.5 font-medium"
                                        }}
                                      >
                                        {tag}
                                      </Chip>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Search size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">No frameworks found</p>
                      </div>
                    )}
                  </div>
                </ScrollShadow>
              </div>

              {/* Right Panel: Details */}
              <div className="w-[400px] shrink-0 bg-default-50/50 flex flex-col h-full">
                <ScrollShadow className="flex-1 p-6">
                  <AnimatePresence mode="wait">
                    {selectedStack ? (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        {/* Header Details */}
                        <div className="text-center space-y-3">
                          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-linear-to-br from-default-100 to-default-50 border border-white/10 shadow-sm p-4">
                            {selectedStack.icon}
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">{selectedStack.name}</h2>
                            <Chip size="sm" variant="dot" color="success" className="mt-1 border-0">
                              {selectedStack.language} Environment
                            </Chip>
                          </div>
                        </div>

                        {/* File Structure */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <LayoutTemplate size={14} />
                            Project Structure
                          </h4>
                          <div className="rounded-xl border border-white/10 bg-background/50 overflow-hidden">
                            <div className="p-1 space-y-0.5">
                              {Object.keys(selectedStack.files).map((file) => (
                                <div
                                  key={file}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-xs rounded-lg transition-colors",
                                    file === selectedStack.run?.entryFile
                                      ? "bg-primary/10 text-primary font-medium"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  <FileCode2 size={14} className={cn(
                                    "shrink-0",
                                    file === selectedStack.run?.entryFile ? "text-primary" : "text-muted-foreground"
                                  )} />
                                  <span className="truncate flex-1">{file}</span>
                                  {file === selectedStack.run?.entryFile && (
                                    <Chip size="sm" variant="flat" color="primary" classNames={{ base: "h-4 text-[9px] min-w-0 p-0" }}>
                                      ENTRY
                                    </Chip>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Run Command */}
                        {selectedStack.run?.command && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                              <Terminal size={14} />
                              Startup Command
                            </h4>
                            <div className="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded-xl font-mono text-xs border border-white/5 flex items-center gap-2 group">
                              <ChevronRight className="text-success shrink-0" size={14} />
                              <span className="break-all">{selectedStack.run.command}</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-default-300 min-h-[300px]">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-default-200 flex items-center justify-center">
                          <LayoutTemplate size={32} className="opacity-50" />
                        </div>
                        <p className="text-sm max-w-[200px]">
                          Select a stack to view details
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollShadow>
              </div>
            </ModalBody>
            <ModalFooter className="flex-col gap-4 bg-background">
              <Input
                placeholder={selectedStack ? `My ${selectedStack.name} Project` : "e.g., My Awesome Project"}
                value={roomName}
                onValueChange={setRoomName}
                variant="bordered"
                label="Room Name"
                labelPlacement="outside"
                isDisabled={!selectedStack || isCreating}
                classNames={{
                  inputWrapper: "border-white/20 hover:border-white/40 group-data-[focus=true]:border-primary"
                }}
              />
              <div className="flex gap-2 justify-end w-full">
                <Button
                  variant="flat"
                  color="danger"
                  onPress={() => onOpenChange(false)}
                  isDisabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateRoom}
                  isLoading={isCreating}
                  isDisabled={!selectedStack || !roomName.trim()}
                  className="shadow-lg"
                >
                  {isCreating ? "Setting up..." : "Create Room"}
                </Button>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
