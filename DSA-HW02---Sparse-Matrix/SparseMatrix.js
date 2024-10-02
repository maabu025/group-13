const fs = require('fs');

class SparseMatrix {
    constructor(numRows = 0, numCols = 0) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.values = new Map();  // Using a Map to store non-zero values
    }

    static fromFile(filePath) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n').map(line => line.trim());
        if (!lines[0].startsWith('rows=') || !lines[1].startsWith('cols=')) {
            throw new Error("Input file has wrong format");
        }
        
        const numRows = parseInt(lines[0].split('=')[1]);
        const numCols = parseInt(lines[1].split('=')[1]);
        const matrix = new SparseMatrix(numRows, numCols);

        for (let i = 2; i < lines.length; i++) {
            if (lines[i] === "") continue; // Ignore empty lines
            const match = lines[i].match(/\((\d+),\s*(\d+),\s*(-?\d+)\)/);
            if (!match) throw new Error("Input file has wrong format");
            const row = parseInt(match[1]);
            const col = parseInt(match[2]);
            const value = parseInt(match[3]);
            matrix.setElement(row, col, value);
        }

        return matrix;
    }

    getElement(row, col) {
        const key = `${row},${col}`;
        return this.values.has(key) ? this.values.get(key) : 0;
    }

    setElement(row, col, value) {
        const key = `${row},${col}`;
        if (value !== 0) {
            this.values.set(key, value);
        } else {
            this.values.delete(key);
        }
    }

    add(matrix) {
        if (this.numRows !== matrix.numRows || this.numCols !== matrix.numCols) {
            throw new Error("Matrix dimensions must match for addition");
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        for (let [key, value] of this.values) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value + matrix.getElement(row, col));
        }

        for (let [key, value] of matrix.values) {
            if (!this.values.has(key)) {
                const [row, col] = key.split(',').map(Number);
                result.setElement(row, col, value);
            }
        }

        return result;
    }

    subtract(matrix) {
        if (this.numRows !== matrix.numRows || this.numCols !== matrix.numCols) {
            throw new Error("Matrix dimensions must match for subtraction");
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        for (let [key, value] of this.values) {
            const [row, col] = key.split(',').map(Number);
            result.setElement(row, col, value - matrix.getElement(row, col));
        }

        for (let [key, value] of matrix.values) {
            if (!this.values.has(key)) {
                const [row, col] = key.split(',').map(Number);
                result.setElement(row, col, -value);
            }
        }

        return result;
    }

    multiply(matrix) {
        if (this.numCols !== matrix.numRows) {
            throw new Error("Number of columns of the first matrix must equal the number of rows of the second matrix");
        }

        const result = new SparseMatrix(this.numRows, matrix.numCols);

        for (let [key, value] of this.values) {
            const [row, col] = key.split(',').map(Number);
            for (let i = 0; i < matrix.numCols; i++) {
                const product = value * matrix.getElement(col, i);
                if (product !== 0) {
                    result.setElement(row, i, result.getElement(row, i) + product);
                }
            }
        }

        return result;
    }

    // Output the matrix in sparse form
    toString() {
        let result = `rows=${this.numRows}\ncols=${this.numCols}\n`;
        for (let [key, value] of this.values) {
            const [row, col] = key.split(',').map(Number);
            result += `(${row}, ${col}, ${value})\n`;
        }
        return result;
    }
}

// Example usage:
// Load matrices from files
const matrix1 = SparseMatrix.fromFile('../sample_inputs/easy_sample_01_2.txt');
const matrix2 = SparseMatrix.fromFile('../sample_inputs/easy_sample_01_3.txt');

// Perform addition
const sum = matrix1.add(matrix2);
console.log(sum.toString());

// Perform subtraction
const diff = matrix1.subtract(matrix2);
console.log(diff.toString());

// Perform multiplication
const product = matrix1.multiply(matrix2);
console.log(product.toString());