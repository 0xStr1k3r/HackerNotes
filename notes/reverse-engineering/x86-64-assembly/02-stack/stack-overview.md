# Stack Overview 

---

## 1. What Is the Stack?

The stack is a **contiguous region of memory** reserved for a program's runtime use. It exists because programs need a place to temporarily store state — things like where to return after a function call, what local variables a function is working with, and what arguments were passed in.

Without the stack, every function call would have no structured way to remember where it came from or what it was doing. The stack solves this by giving each function its own private workspace that is automatically cleaned up when the function finishes.

> **Analogy:** Think of a stack of plates. You always add and remove from the top — never the middle or bottom.

---

## 2. LIFO — Last In, First Out

The stack operates on a strict **LIFO** principle: the last thing placed on the stack is the first thing taken off.

This isn't arbitrary — it maps perfectly to how function calls nest:

```
main() calls foo()
  foo() calls bar()
    bar() returns  ← bar's frame is removed first
  foo() returns    ← then foo's frame
main() returns     ← then main's frame
```

Each function's data sits "on top" of the caller's data, and is cleaned up before the caller's data is ever touched. LIFO enforces this naturally.

---

## 3. Memory Layout — How the Stack Grows

In x86-64, the stack lives in the **high-address region** of a process's virtual memory and **grows downward** toward lower addresses.

```
High addresses  ┌──────────────────────┐
                │   Stack (grows ↓)    │
                │                      │
                │   ← RSP moves here   │
                │   as stack grows     │
                │                      │
                │        ...           │
                │                      │
                │   Heap (grows ↑)     │
Low addresses   └──────────────────────┘
```

- **Allocating** space on the stack moves RSP to a **lower** address.
- **Deallocating** moves RSP to a **higher** address.
- "Top of the stack" physically means the **lowest currently active address**.

This inverted growth is a historical convention and is baked into x86-64 architecture.

---

## 4. Role of RSP and RBP

Since you already know these registers, here's how they tie directly into the stack:

### RSP — Stack Pointer
- Always points to the **current top of the stack** (the lowest active address).
- Every allocation/deallocation on the stack moves RSP.
- RSP is the live, moving boundary of the stack.

### RBP — Base Pointer (Frame Pointer)
- Points to the **base of the current function's stack frame**.
- Unlike RSP, RBP stays **fixed** for the duration of a function call.
- This stability is what allows a function to reliably reference its own local variables and parameters using fixed offsets from RBP (e.g., `[rbp - 8]`, `[rbp + 16]`).

```
High addr   │  ...caller's frame...  │
            ├────────────────────────┤  ← RBP (fixed for current function)
            │  saved registers       │
            │  local variable A      │  [rbp - 8]
            │  local variable B      │  [rbp - 16]
            ├────────────────────────┤  ← RSP (moves as stack is used)
Low addr    │  (unallocated)         │
```

> RBP is your stable anchor; RSP is the moving frontier.

---

## 5. What Lives on the Stack?

The stack holds **short-lived, scoped data** — things that exist only while a particular function is active:

| Data | Description |
|---|---|
| **Return addresses** | Where execution should resume after a function returns |
| **Saved registers** | Caller's register values preserved across a function call |
| **Local variables** | Variables declared inside a function |
| **Function arguments** | The first 6 integer args go in registers; beyond that, they spill to the stack |
| **Stack frame metadata** | The saved RBP of the previous frame |

What does **not** live on the stack: heap-allocated memory (`malloc`), global/static variables, or program code — those live in other segments.

---

## 6. Why the Stack Matters

The stack is not just a convenience — it is the **fundamental mechanism** that enables:

- **Function calls** — Without the stack, there's no standard way to call a function and return from it.
- **Recursion** — Each recursive call gets its own frame with its own local state, all stacked on top of each other.
- **Scoped lifetimes** — Local variables automatically cease to exist when a function returns, because the frame is simply discarded.
- **The calling convention** — x86-64's System V ABI (the standard on Linux/macOS) is built around stack discipline. All programs follow the same rules, allowing code compiled separately to interoperate.
- **Security relevance** — Stack-based vulnerabilities (buffer overflows, stack smashing) are among the most studied attack surfaces in low-level security, precisely because control flow (return addresses) lives here.

---

## Summary Table

| Concept | Key Fact |
|---|---|
| Growth direction | High → Low (downward) |
| Access discipline | LIFO |
| RSP role | Tracks the current top of the stack |
| RBP role | Anchors the current stack frame |
| Data stored | Return addresses, locals, saved registers, spilled args |
| Lifetime of data | Tied to the function that created it |
