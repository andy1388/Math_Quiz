"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generators = void 0;
const F2L2_5_Generator_Q1_F_MQ_1 = __importDefault(require("./F2L2.5_Generator_Q1_F_MQ"));
const F2L2_5_Generator_Q2_N_MQ_1 = __importDefault(require("./F2L2.5_Generator_Q2_N_MQ"));
const F2L2_5_Generator_Q3_N_MQ_1 = __importDefault(require("./F2L2.5_Generator_Q3_N_MQ"));
const F2L2_5_Generator_Q4_N_MQ_1 = __importDefault(require("./F2L2.5_Generator_Q4_N_MQ"));
exports.generators = {
    'F2L2.5_Generator_Q1_F_MQ': F2L2_5_Generator_Q1_F_MQ_1.default,
    'F2L2.5_Generator_Q2_N_MQ': F2L2_5_Generator_Q2_N_MQ_1.default,
    'F2L2.5_Generator_Q3_N_MQ': F2L2_5_Generator_Q3_N_MQ_1.default,
    'F2L2.5_Generator_Q4_N_MQ': F2L2_5_Generator_Q4_N_MQ_1.default
};
