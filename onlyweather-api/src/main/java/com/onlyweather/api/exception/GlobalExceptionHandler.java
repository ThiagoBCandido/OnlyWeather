package com.onlyweather.api.exception;

import com.onlyweather.api.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleCityNotFound(CityNotFoundException exception, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(LocalDateTime.now(), HttpStatus.NOT_FOUND.value(), "Not Found", exception.getMessage(), request.getRequestURI());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ConstraintViolationException exception, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(LocalDateTime.now(), HttpStatus.BAD_REQUEST.value(), "Bad Request", "O parâmetro city é obrigatório.", request.getRequestURI());
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception exception, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(LocalDateTime.now(), HttpStatus.INTERNAL_SERVER_ERROR.value(), "Internal Server Error", "Não foi possível buscar o clima agora.", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}