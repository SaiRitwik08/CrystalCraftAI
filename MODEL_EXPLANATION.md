# CrystaLLM: A Guide for your Review

This guide explains how the CrystaLLM model works in simple terms. It covers the core concepts, the architecture, important parameters, and how it actually creates new crystals.

## 1. The Core Concept: "Crystals as Language"
The most important idea to understand is that **CrystaLLM treats crystal structures like a language.**

*   **Standard Language Models (like ChatGPT):** Read text (English) and predict the next word.
*   **CrystaLLM:** Reads **CIF files** (Crystal Information Files) and predicts the next number or symbol.

A CIF file is just text that describes a 3D crystal. By training a model on millions of these text files, it "learns" chemistry and physics just by learning the grammar of CIF files.

## 2. How It Works (Step-by-Step)

### Step A: Tokenization (Text to Numbers)
Computers can't read text; they read numbers.
1.  **Input:** A line of a CIF file (e.g., `_cell_length_a 5.68`).
2.  **Tokenizer:** Breaks this into chunks called "tokens".
    *   `_cell_length_a` -> Token ID `42`
    *   `5.68` -> Token ID `105`
3.  **Result:** The entire crystal becomes a sequence of numbers: `[42, 105, 88, ...]`.

### Step B: The "Transformer" Brain
The model architecture is a **Decoder-only Transformer** (specifically, a GPT style model).
*   **Embeddings:** Converts token IDs into rich vectors (lists of numbers) that capture meaning.
*   **Attention Mechanism:** This is the magic. When looking at one token, the model can "attend" (look back) at all previous tokens to understand context.
    *   *Example:* If it sees "Na" (Sodium), it looks back and sees "Cl" (Chlorine) earlier, so it knows the bond length should be suited for salt.

### Step C: Training (Next-Token Prediction)
The model is trained with a simple game: **"Guess the next token."**
*   We give it: `data_Na`
*   It guesses: `Cl`
*   If it guesses wrong, we adjust its internal dials (weights) so it gets it right next time.
*   We do this billions of times until it understands the structure of crystals perfectly.

## 3. Important Parameters (The "Knobs")

When describing the model to your reviewers, mention these key parameters:

### Architecture Parameters (Structure of the Brain)
1.  **`n_layer` (Number of Layers):** How "deep" the network is. More layers = more complex reasoning.
    *   *Your Model:* 6 layers (Small, but fast).
2.  **`n_head` (Attention Heads):** How many different "things" it can focus on at once.
    *   *Your Model:* 6 heads.
3.  **`n_embd` (Embedding Dimension):** The width of the thought vector. Larger = more detailed concepts.
    *   *Your Model:* 384 dimensions.
4.  **`block_size` (Context Window):** How far back it can look.
    *   *Your Model:* 512 tokens (It can remember the last 512 parts of the file).

### Training Parameters (How it Learns)
1.  **`batch_size`:** How many examples it studies at once.
    *   *Your Run:* 64 examples (8 batch size * 8 gradient accumulation).
2.  **`max_iters`:** How long it trains.
    *   *Your Run:* 10,000 steps.
3.  **`learning_rate`:** How fast it changes its mind. Too high = erratic; too low = slow.
    *   *Your Run:* 3e-4 (0.0003).

## 4. How Generation Works (Sampling)

When you run the demo, the model generates a crystal token-by-token.

1.  **Prompt:** You give it a starting formula (e.g., `data_MgO`).
2.  **Probability:** It calculates the % chance for every possible next character.
    *   `\n`: 80%
    *   `_`: 15%
    *   `A`: 5%
3.  **Sampling:** It picks one based on those odds.
4.  **Loop:** It adds the picked one to the list and repeats until the file is done.

### Sampling Knobs
*   **Temperature:** Controls creativity.
    *   `1.0`: Random / Creative (Good for discovering new materials).
    *   `0.1`: Conservative / Safe (Good for reproducing known materials).
    *   *Your setting:* 0.8 (Balanced).
*   **Top-K:** Limits choices to the top K best guesses (e.g., top 10) to prevent gibberish.

## 5. Summary for Your Review
*   **What is it?** A GPT-style language model trained on Crystal Information Files (CIFs).
*   **Goal:** To generate valid, stable crystal structures for new materials.
*   **Why CIFs?** Because they represent 3D geometry as 1D text, which Transformers are excellent at processing.
*   **Result:** The model learns symmetry, stoichiometry (chemical balance), and atomic distances purely from reading text files.
